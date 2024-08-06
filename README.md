<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

<div align="center">

[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

</div>

[contributors-shield]: https://img.shields.io/github/contributors/omrfrkcpr/habithub-api.svg?style=flat-square&color=blue
[contributors-url]: https://github.com/omrfrkcpr/habithub-api/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/omrfrkcpr/habithub-api.svg?style=flat-square&color=blueviolet
[forks-url]: https://github.com/omrfrkcpr/habithub-api/network/members
[stars-shield]: https://img.shields.io/github/stars/omrfrkcpr/habithub-api.svg?style=flat-square&color=brightgreen
[stars-url]: https://github.com/omrfrkcpr/habithub-api/stargazers
[issues-shield]: https://img.shields.io/github/issues/omrfrkcpr/habithub-api.svg?style=flat-square&color=red
[issues-url]: https://github.com/omrfrkcpr/habithub-api/issues
[license-shield]: https://img.shields.io/github/license/omrfrkcpr/habithub-api.svg?style=flat-square&color=yellow
[license-url]: https://github.com/omrfrkcpr/habithub-api/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&color=blue
[linkedin-url]: https://linkedin.com/in/omrfrkcpr

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/omrfrkcpr/habithub-api">
    <img src="https://habithub.s3.eu-north-1.amazonaws.com/habithub-assets/habithub-api.png" alt="Logo" width="100" height="100">
  </a>

<h3 align="center">Habithub-api</h3>

  <p align="center">
    The backend API for the Habithub project. It provides RESTful endpoints to manage tasks, users, and other related data. Built with Node.js and Express.js, it ensures efficient data handling and secure user authentication.
    <br />
    <a href="https://github.com/omrfrkcpr/habithub-api"><strong>Explore the docs »</strong></a>
    <br />
    <a href="https://github.com/omrfrkcpr/habithub"><strong>Habithub App»</strong></a>
    <br />
    <br />
    <a href="https://habithub-api.onrender.com/">View API</a>
    ·
    <a href="https://github.com/omrfrkcpr/habithub-api/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/omrfrkcpr/habithub-api/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#erd">ERD</a></li>
        <li><a href="#authentication-process">Authentication Process</a></li>
      </ul>
    </li>
    <li><a href="#structure">Structure</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#components">Components</a></li>
    <li><a href="#technical">Technical</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- AUTHENTICATION PROCESS -->

### Built With

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nodejs,express,sqlite,sequelize,js,npm,postman" />
  </a>
</p>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ERD - Entity-Relationship Diagram  -->

### ERD

![ERD](https://habithub.s3.eu-north-1.amazonaws.com/habithub-assets/habithub-erd.png)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- AUTHENTICATION PROCESS -->

### Authentication Process

This project implements a comprehensive authentication system using the following technologies: Node.js, Express.js, JWT, Simple Token, MongoDB, Mongoose, Passport.js, Session, Nodemailer, and AWS-S3. Below is a detailed overview of the authentication process:

#### User Registration and Verification

1. **User Registration**:

   - Users fill out a registration form on the web/mobile application.
   - The backend server receives the user data and encrypts the password using a hashing algorithm.
   - The encrypted user data is saved to MongoDB.

2. **Email Verification**:
   - An email verification link is sent to the user's email address using Nodemailer.
   - Users must click the verification link to activate their account.
   - The backend server verifies the token from the link and activates the user account.

#### Social Media Login

1. **OAuth Login**:
   - Users can log in using their Google, Twitter, or GitHub accounts via Passport.js.
   - Passport.js handles the OAuth flow and retrieves user data from the social media platforms.
   - If the user does not exist in the database, a new user is created with the retrieved data.
   - User session data is stored using express-session.

#### Login and Token Management

1. **User Login**:

   - Users can log in manually with their credentials or through social media accounts.
   - Upon successful login, the backend server generates a Simple Token and JWT (access and refresh tokens).

2. **Token Usage**:
   - The JWT allows users to access protected routes and perform authorized actions within the application.
   - The session duration is set to 45 minutes. If needed, the access token can be refreshed using the refresh token to extend the session by another 45 minutes.
   - If the session expires without token refresh, users are redirected to the login page to re-authenticate.

#### Password Security

- When creating an account, user passwords are securely hashed before storing in the database to ensure confidentiality.

#### Avatar Management

1. **Social Media Avatars**:

   - When users log in through social media, their avatar URL is automatically fetched and stored.

2. **Manual Avatar Upload**:
   - Users can manually upload their avatar photos, which are then stored in AWS-S3.
   - The URL of the uploaded avatar is saved in the database.

#### Visual Diagram

To better understand the authentication flow, here is a visual representation:

<!-- Add your visual diagram link or embed it here -->

![Habithub-Auth-Diagramm](https://habithub.s3.eu-north-1.amazonaws.com/habithub-assets/habithub-auth-process.png)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- STRUCTURE -->

## Structure

```
habithub-api
  ├── logs
  ├── src/
  |     ├── configs
  |     |     ├── email/
  |     |     ├── passportjs-auth
  |     |     ├── dbConnection.js
  |     |     └── swagger.json
  |     ├── controllers
  |     |     ├── authController.js
  |     |     ├── tagController.js
  |     |     ├── taskController.js
  |     |     ├── tokenController.js
  |     |     └── userController.js
  |     ├── controllers
  |     |     └── customError.js
  |     ├── middlewares
  |     |     ├── authentication.js
  |     |     ├── awsS3Upload.js
  |     |     ├── errorHandler.js
  |     |     ├── idValidation.js
  |     |     ├── localUpload.js
  |     |     ├── logger.js
  |     |     ├── permissions.js
  |     |     ├── queryHandler.js
  |     |     └── rateLimiters.js
  |     ├── models
  |     |     ├── tagModel.js
  |     |     ├── taskModel.js
  |     |     ├── tokenBlacklistModel.js
  |     |     ├── tokenModel.js
  |     |     ├── tokenVerificationModel.js
  |     |     └── userModel.js
  |     └── routers
  |           ├── authRouter.js
  |           ├── documentRouter.js
  |           ├── index.js
  |           ├── tagRouter.js
  |           ├── taskRouter.js
  |           ├── tokenRouter.js
  |           └── userRouter.js
  ├── .dockerignore
  ├── .gitignore
  ├── .sample-env
  ├── dockerfile
  ├── habithub-auth-process.png
  ├── habithub-erd.png
  ├── habithub-auth-process.png
  ├── index.js
  ├── LICENSE
  ├── package-lock.json
  ├── package.json
  ├── README.md    // Project documentation
  ├── swaggerAutogen.js
  └── vercel.json
```

See the [open issues](https://github.com/omrfrkcpr/habithub-api/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FEATURES -->

## Features

CRUD Operations:

- Create: Add new task with detailed information such as name, description, dueDates....
- Read: Retrieve information about single task, either all at once or individually by ID.
- Update: Modify the details of existing task.
- Delete: Remove task from the collection.

MVC Architecture:

- Model: Defines the structure of the task data and interacts with the MongoDb database using Mongoose ODM.
- View: Though typically associated with frontend, in this context, it refers to the response sent back to the client.
- Controller: Handles incoming requests, processes data using models, and returns the appropriate responses.

Database Management:

- Utilizes MongoDB for non-relational database, server-side storage.
- Mongoose ODM provides an easy-to-use interface for database operations, enabling complex queries and relationships.

Routing:

- Express.js handles routing, directing API requests to the appropriate controllers.
- Organized routes for handling task-related operations.

Error Handling:

- Robust error handling to manage invalid inputs, missing data, and other potential issues.
- Custom error messages to guide users and developers.

Middleware:

- Utilizes Express middleware for parsing request bodies, handling JSON data, and managing static files.
- Passportjs middleware for authenticating with Google accounts

Tools and Technologies:

- Postman is used for API testing, ensuring that all endpoints are functioning correctly and efficiently.
  The application is hosted on Render, a reliable hosting service that ensures high availability and performance.
- Docker is used for running application serverless with container
- DrawSQL is used for creating an ERD for project.

Deployment:

- The project is deployed on Render, allowing for easy access and scalability. Vercel and Render's platforms provide automatic builds and deployments, making the development process smoother.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- COMPONENTS -->

## Components

Models:

- Defined using Mongoose to represent the data structures.
- Models (Task,Tag, User and Token) include fields for details.
- Associations and validations ensure data integrity and consistency.

Controllers:

- Contain the logic for handling CRUD operations.
- Interact with Mongoose models to perform database operations.
- Return JSON responses to the client, containing data or error messages as appropriate.

Routes:

- Defined in Express to handle API endpoints.
- Routes map to controller actions for creating, reading, updating, and deleting tasks.

Example endpoints:

- POST /tasks - Create a new task.
- GET /tasks - Retrieve all tasks.
- GET /tasks/:id - Retrieve a specific task by ID.
- POST /tasks/email - Retrieve daily tasks via Email
- PUT /tasks/:id - Update a task by ID.
- PATCH /tasks/:id - Update a task by ID.
- DELETE /tasks/:id - Delete a task by ID.

For more endpoints check out [Swagger Document](https://habithub-api.onrender.com/documents/swagger/)

Middleware:

- Used to parse incoming request bodies (e.g., express.json()).
- Additional middleware can be added for authentication, logging, permissions and limiters etc.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TECHNICAL -->

## Technical

Frontend:

- React: A JavaScript library for building user interfaces.
- TypeScript: A statically typed superset of JavaScript.
- TailwindCSS: A utility-first CSS framework for rapid UI development.
- Redux & Toolkit: For managing state across the application.

- JEST: For Unit testing

Backend:

- Node.js: A JavaScript runtime built on Chrome's V8 engine.
- Express.js: A minimal and flexible Node.js web application framework.
- MongoDb: A document database used to build highly available and scalable internet applications.
- Mongoose: An ODM (Object Data Modeling) library for MongoDB, provides a straight-forward, schema-based solution to model your application data
- JWT: JSON Web Token (JWT) is a compact URL-safe means of representing claims to be transferred between two parties
- Passportjs: A popular middleware for Node. js that simplifies the process of implementing authentication and authorization in web apps
- Docker: A platform designed to help developers build, share, and run container applications.
- AWS-S3: Amazon Simple Storage Service (Amazon S3) is an object storage service offering industry-leading scalability, data availability, security, and performance.
- Nodemailer: A Node JS module that allows you to send emails from your server easily.

Tools:

- Postman: An API client for testing and developing APIs.
- DrawSQL: Helps dev teams create beautiful schema diagrams to document their database entity relationships (ERD: Entity-Relationship Diagram)
- Render: A cloud platform for hosting web applications. (backend)
- Vercel: A cloud plattform for hosting web applications. (frontend)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See [LICENSE.txt](https://github.com/omrfrkcpr/habithub-api/blob/main/LICENSE) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

[Support](omerrfarukcapur@gmail.com)<br />

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [APP](https://habithub.de)<br />
- [APP-Repo](https://github.com/omrfrkcpr/habithub)<br />
- [API](https://habithub-api.onrender.com/)<br />
- [API-Repo](https://github.com/omrfrkcpr/habithub-api)<br />
- [Dockerhub]()<br />
- [postman-docs]()

<p align="right">(<a href="#readme-top">back to top</a>)</p>
