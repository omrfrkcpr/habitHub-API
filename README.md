**Authentication Process**

- This project implements a comprehensive authentication system using the following technologies: Node.js, Express.js, JWT, Simple Token, MongoDB, Mongoose, Passport.js, Session, Nodemailer, and AWS-S3. Below is a detailed overview of the authentication process:

**User Registration and Verification**

1- User Registration:

- Users fill out a registration form on the web/mobile application.
- The backend server receives the user data and encrypts the password using a hashing algorithm.
- The encrypted user data is saved to MongoDB.

2- Email Verification:

- An email verification link is sent to the user's email address using Nodemailer.
- Users must click the verification link to activate their account.
- The backend server verifies the token from the link and activates the user account.

**Social Media Login**

1- OAuth Login:

- Users can log in using their Google, Twitter, or GitHub accounts via Passport.js.
- Passport.js handles the OAuth flow and retrieves user data from the social media platforms.
- If the user does not exist in the database, a new user is created with the retrieved data.
- User session data is stored using express-session.

**Login and Token Management**

1- User Login:

- Users can log in manually with their credentials or through social media accounts.
- Upon successful login, the backend server generates a Simple Token and JWT (access and refresh tokens).

2- Token Usage:

- The JWT allows users to access protected routes and perform authorized actions within the application.
- The session duration is set to 45 minutes. If needed, the access token can be refreshed using the refresh token to extend the session by another 45 minutes.
- If the session expires without token refresh, users are redirected to the login page to re-authenticate.

**Password Security**

- When creating an account, user passwords are securely hashed before storing in the database to ensure confidentiality.

**Avatar Management**

1- Social Media Avatars:

- When users log in through social media, their avatar URL is automatically fetched and stored.

2- Manual Avatar Upload:

- Users can manually upload their avatar photos, which are then stored in AWS-S3.
- The URL of the uploaded avatar is saved in the database.

**Visual Diagram**

- To better understand the authentication flow, here is a visual representation:
  
![habithub-auth](https://github.com/user-attachments/assets/626e84e9-b684-4e31-903f-44b334ca7806)

User -> Web/Mobile Application (Submit registration form)
Web/Mobile Application -> Backend Server (Data processing and encryption)
Backend Server -> Database (Save data)
Backend Server -> Email Server (Send verification email)
User -> Email Server (Click verification link)
Email Server -> Backend Server (Verification check)
Social Media Login:

User -> Passport.js (Initiate OAuth login)
Passport.js -> Social Media Platform (Authenticate and retrieve user data)
Social Media Platform -> Passport.js (Return user data)
Passport.js -> Backend Server (Create/verify user)
Backend Server -> express-session (Store session data)
Login and Token Management:

User -> Backend Server (Login request)
Backend Server -> JWT and Simple Token (Generate tokens)
User -> Backend Server (Perform actions with tokens)
Backend Server -> User (Refresh tokens if needed)
Avatar Management:

Social Media Login: User -> Social Media Platform (Fetch avatar URL)
Manual Upload: User -> AWS-S3 (Upload avatar) -> Backend Server (Save URL)
By following this detailed process, the authentication system ensures secure and seamless user management in the application.
