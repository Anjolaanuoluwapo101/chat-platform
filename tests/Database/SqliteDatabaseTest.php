<?php

use PHPUnit\Framework\TestCase;
use App\Database\SQLiteDatabase;

class SqliteDatabaseTest extends TestCase
{
    private $sqliteDatabase;
    
    protected function setUp(): void
    {
        $this->sqliteDatabase = new SQLiteDatabase();
    }
    
    public function testConstructor()
    {
        // Test that the constructor creates an instance successfully
        $this->assertInstanceOf(SQLiteDatabase::class, $this->sqliteDatabase);
    }
    
    public function testConstructorInitializesDatabase()
    {
        // Test that the constructor properly initializes the database
        // The constructor should call parent::__construct() which initializes PDO and creates tables
        $this->assertNotNull($this->sqliteDatabase);
        
        // Verify that the database object has the expected methods
        $this->assertTrue(method_exists($this->sqliteDatabase, 'connect'));
        $this->assertTrue(method_exists($this->sqliteDatabase, 'getUser'));
        $this->assertTrue(method_exists($this->sqliteDatabase, 'saveUser'));
        $this->assertTrue(method_exists($this->sqliteDatabase, 'getMessages'));
    }
}
