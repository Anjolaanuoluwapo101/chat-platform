# Anonymous Chat Platform - TalkYourTalk

This is a full-stack web application that allows users to send anonymous messages to friends. 

## Features

- **User Authentication:** Secure registration and login systems.
- **Anonymous Messaging:** Publicly accessible profile links allow anyone to send messages without signing up.
- **Group Messaging:** Supports group creation that allows registered users to join and chat with other, whether anonymously or non-anonymously.
- **Message Dashboard:** Registered users can view and manage their received messages
- **Supports Media:*** Media can be sent over the platform.
- **RealTime Communication:** Messages are delivered via websockets, no need for page refresh. Also notifications can be received from your browsers when a message is received.
  
- **Containerized Environment:** Includes Docker and Nginx configurations for consistent deployment.

## Technology Stack

- **Backend:** PHP (7.4+)
- **Frontend:** TypeScript
- **Web Server:** Nginx
- **Dependency Management:** Composer (PHP), npm (Node.js)
- **Containerization:** Docker

## Project Structure

The repository is organized as follows:

- **app/**: Contains the core PHP application logic and backend controllers.
- **database/**: Handles data storage configurations and files.
- **frontendModified/**: Contains the TypeScript source code for the client-side application.
- **public/**: The entry point for the web server, serving static assets and handling requests.
- **logs/**: Application log files for debugging and monitoring.
- **tests/**: Automated tests for the application.


## Prerequisites

Before running this project, ensure you have the following installed:

- PHP (version 7.4 or higher)
- Composer
- Node.js and npm
- Docker (optional, for containerized execution)

## Installation and Setup

### Method 1: Using Docker (Recommended)

1. Clone the repository:
   ```
   git clone https://github.com/Anjolaanuoluwapo101/chat-platform.git
   cd chat-platform
   ```

3. Build the Docker image:
   ```
   docker build -t chat-platform .
   ```
   
5. Run the container:
    ```
   docker run -p 8080:80 chat-platform
    ```
    
7. Access the application by visiting:
   ```
   http://localhost:8080 in your web browser.
   ```

### Method 2: Manual Installation

1. Clone the repository:
   ```
   git clone https://github.com/Anjolaanuoluwapo101/chat-platform.git
   cd chat-platform
   ```
   
3. Install Backend Dependencies:
   ```
   Navigate to the root directory and run:
   composer install
   ```

5. Install Frontend Dependencies:
   Navigate to the frontend directory (check `package.json` location, typically root or frontendModified folder) and run:
   ```
   npm install
   ```

7. Compile TypeScript:
   Start the frontend server:
   ```
   npm run dev
   ```

9. Configure Environment:
   If an `.env.example` file exists, copy it to `.env` and configure your database and environment settings.
   If not present, then. I've probably deleted it. You can request for it by submitting an issue.

11. Start the Server:
   You can use the built-in PHP server for development:
   ```
   php -S localhost:8000 -t public
   ```

   Access the application at http://localhost:8000.

## Usage

1. **Register:** Create a new account on the homepage.
2. **Get Link:** Once logged in, copy your unique single channel link
3. **Share:** Share the link on social media or with friends.


## Contributing

Contributions are welcome. Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature (git checkout -b feature/NewFeature).
3. Commit your changes (git commit -m 'Add some NewFeature').
4. Push to the branch (git push origin feature/NewFeature).
5. Open a Pull Request.

## License

This project is open-source. Please refer to the repository settings for specific license information.
