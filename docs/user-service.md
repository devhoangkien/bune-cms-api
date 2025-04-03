# User Service Documentation

## Overview
The `user-service` is a microservice responsible for managing user-related operations in the system. It handles user registration, authentication, profile management, and other user-centric functionalities.

## Features
- User registration and account creation
- User authentication (login/logout)
- Password management (reset/update)
- User profile management
- Role-based access control (RBAC)

## API Endpoints

### Authentication
#### `POST /auth/register`
- **Description**: Registers a new user.
- **Request Body**:
    ```json
    {
        "username": "string",
        "email": "string",
        "password": "string"
    }
    ```
- **Response**:
    ```json
    {
        "message": "User registered successfully",
        "userId": "string"
    }
    ```

#### `POST /auth/login`
- **Description**: Authenticates a user and returns a token.
- **Request Body**:
    ```json
    {
        "email": "string",
        "password": "string"
    }
    ```
- **Response**:
    ```json
    {
        "token": "string",
        "expiresIn": "number"
    }
    ```

### User Management
#### `GET /users/:id`
- **Description**: Fetches user details by ID.
- **Response**:
    ```json
    {
        "id": "string",
        "username": "string",
        "email": "string",
        "roles": ["string"]
    }
    ```

#### `PUT /users/:id`
- **Description**: Updates user details.
- **Request Body**:
    ```json
    {
        "username": "string",
        "email": "string"
    }
    ```
- **Response**:
    ```json
    {
        "message": "User updated successfully"
    }
    ```

### Password Management
#### `POST /auth/reset-password`
- **Description**: Sends a password reset link to the user's email.
- **Request Body**:
    ```json
    {
        "email": "string"
    }
    ```
- **Response**:
    ```json
    {
        "message": "Password reset link sent"
    }
    ```

#### `POST /auth/update-password`
- **Description**: Updates the user's password.
- **Request Body**:
    ```json
    {
        "token": "string",
        "newPassword": "string"
    }
    ```
- **Response**:
    ```json
    {
        "message": "Password updated successfully"
    }
    ```

## Configuration
- **Environment Variables**:
    - `DATABASE_URL`: Connection string for the database.
    - `JWT_SECRET`: Secret key for signing JWT tokens.
    - `PORT`: Port on which the service runs.

## Dependencies
- **Database**: PostgreSQL or MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Message Queue**: RabbitMQ (optional, for event-driven communication)

## Deployment
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set environment variables in `.env`.
4. Start the service: `npm start`.

## Testing
- Run unit tests: `npm test`.
- API testing can be performed using tools like Postman or cURL.

## Contributing
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit changes: `git commit -m "Description of changes"`.
4. Push to the branch: `git push origin feature-name`.
5. Create a pull request.

## License
This project is licensed under the MIT License.
