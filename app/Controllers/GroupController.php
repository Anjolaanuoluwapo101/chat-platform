<?php

namespace App\Controllers;

use App\Models\Group;
use App\Log\Logger;

class GroupController extends BaseController
{
    private $groupModel;
    private $logger;
    private $authService;
    private $user;
    private $userId;

    public function __construct()
    {
        parent::__construct();
        $this->groupModel = new Group();
        $this->logger = new Logger();
    }

    protected function authenticateUser()
    {
        if (!isset($this->authService)) {
            $this->authService = new \App\Services\AuthService();
        }
        $user = $this->authService->authenticateFromToken();
        if ($user) {
            $this->user = $user;
            $this->userId = $user['id'];
        }
        return $user;
    }

    public function createGroup()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $name = $input['name'] ?? '';

        if (!$name) {
            $this->jsonResponse(['success' => false, 'error' => 'Group name required'], 400);
            return;
        }

        $groupId = $this->groupModel->create($name);
        if ($groupId) {
            // add creator as member
            $this->groupModel->addMember($groupId, $user['id']);
            $this->jsonResponse(['success' => true, 'group_id' => $groupId]);
        } else {
            $this->jsonResponse(['success' => false, 'error' => 'Failed to create group'], 500);
        }
    }

    public function joinGroup()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $groupId = isset($input['group_id']) ? intval($input['group_id']) : 0;
        if (!$groupId) {
            $this->jsonResponse(['success' => false, 'error' => 'group_id required'], 400);
            return;
        }

        $added = $this->groupModel->addMember($groupId, $user['id']);
        if ($added) {
            $this->jsonResponse(['success' => true], 200);
        } else {
            $this->jsonResponse(['success' => false, 'error' => 'Failed to join group'], 500);
        }
    }

    public function getInfo()
    {
        $user = $this->authenticateUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required'], 401);
            return;
        }

        $groupId = isset($_GET['group_id']) ? intval($_GET['group_id']) : 0;
        if (!$groupId) {
            $this->jsonResponse(['success' => false, 'error' => 'group_id required'], 400);
            return;
        }

        $group = $this->groupModel->get($groupId);
        $isMember = $this->groupModel->isMember($groupId, $user['id']);

        $this->jsonResponse(['success' => true, 'group' => $group, 'is_member' => (bool)$isMember]);
    }
}
