# Refactoring Pusher Integration for Group Messages Support

## Tasks
- [x] Create `app/Services/ChannelManager.php` to handle channel naming and type determination (public for individuals, private for groups).
- [x] Enhance `app/Services/PusherService.php` to support authentication for private channels (add method to generate auth responses).
- [x] Update `app/Controllers/MessageController.php` to use `ChannelManager` for channel selection and add authentication endpoint for Pusher.
- [x] Modify `public/js/pusher.js` to handle authentication when subscribing to private channels.
- [x] Test individual messages to ensure no regression.
- [x] Implement group message logic separately (e.g., new controller methods for groups).
- [x] Add user authentication checks for private channels.

# Migration to React Frontend

## Tasks
- [x] Set up React project with create-react-app.
- [x] Install dependencies: axios, pusher-js, react-router-dom.
- [x] Modify PHP backend for JSON responses and CORS.
- [x] Create React components for UI (Login, Register, Messages).
- [x] Implement API calls with Axios.
- [x] Integrate Pusher in React for real-time updates.
- [x] Handle authentication and routing in React.

## Backend API Refactoring

## Tasks
- [x] Refactor `app/Controllers/GroupController.php` to use JWT authentication and return JSON responses.
- [x] Update `app/Controllers/MessageController.php` to use JWT authentication and return JSON responses.
- [x] Fix method name in `public/messages.php` to match `MessageController::viewMessages`.
- [x] Refactor `app/Controllers/UserController.php` to remove backward compatibility and use only JSON API responses.
- [x] Test API endpoints for proper JSON responses and authentication.

## Frontend Group Components
- [ ] Create Groups.js component to list user's groups
- [ ] Create CreateGroup.js component for group creation
- [ ] Create GroupMessages.js component for group messaging
- [ ] Update App.js routing to include group routes
- [ ] Update navigation in components
- [ ] Create group service for API calls
- [ ] Test group functionality
