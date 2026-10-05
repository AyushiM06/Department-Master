\# Department Master



Department Master is a full-stack enterprise application designed for centralized management of departments and their related information.



The application follows a \*\*microservices-based backend architecture\*\* with a \*\*React + TypeScript frontend\*\*. It provides department management, dashboard statistics, activity tracking, attachments, Excel import/export, authentication, authorization, caching, and notification functionality.



The backend services are containerized using Docker and deployed on AWS EC2, while the frontend is deployed on Netlify.



\---



\## 🚀 Live Application



\### Frontend



https://inspiring-llama-9b03a1.netlify.app



The production frontend is hosted on Netlify.



The backend is deployed on AWS EC2 and exposed through a Cloudflare Tunnel.



\---



\# 📌 Project Overview



Department Master provides a centralized platform for managing department-related information and operations.



The application supports:



\- Department creation

\- Department update

\- Department activation/inactivation

\- Department search

\- Department filtering

\- Pagination and sorting

\- Dashboard statistics

\- Department activity and history

\- Department attachments

\- Excel import

\- Excel export

\- Notification management

\- JWT-based authentication

\- Role-based authorization

\- Redis caching

\- Microservices-based backend architecture

\- Dockerized deployment

\- AWS EC2 deployment

\- Netlify frontend deployment



\---



\# 🏗️ System Architecture



Department Master is developed using a \*\*microservices architecture\*\* where different business and infrastructure responsibilities are separated into independent services.



The frontend communicates with the backend through the \*\*API Gateway\*\*. The Gateway handles request routing, CORS configuration, and security-related processing before forwarding requests to the appropriate backend service.



\---



\## Application Components



\### Frontend



The frontend is developed using:



\- React

\- TypeScript

\- Vite

\- Redux Toolkit

\- React Router

\- Material UI

\- Material React Table

\- React Hook Form

\- Yup

\- Axios

\- SweetAlert2



The frontend provides the user interface for:



\- Authentication

\- Dashboard

\- Department Management

\- Department Activity

\- Department Search and Filtering

\- Department Creation

\- Department Update

\- Department Attachments

\- Excel Import/Export

\- Notifications



The production frontend is hosted on \*\*Netlify\*\*.



\---



\## API Gateway



The Gateway acts as the main entry point for frontend API requests.



\### Responsibilities



\- API request routing

\- CORS configuration

\- JWT-based request security

\- Authentication request handling

\- Communication with backend microservices



\*\*Port:\*\* `8085`



\---



\## Auth Service



The Auth Service is responsible for application authentication.



\### Responsibilities



\- User login

\- Authentication

\- JWT token generation

\- Authentication-related APIs



\*\*Port:\*\* `8081`



\---



\## Department Service



The Department Service contains the main business functionality of the application.



\### Responsibilities



\- Department creation

\- Department update

\- Department listing

\- Department search

\- Department filtering

\- Department activation/inactivation

\- Department dashboard statistics

\- Department activity/history

\- Department attachments

\- Excel import

\- Excel export

\- Department notifications



\*\*Port:\*\* `8080`



\---



\## User Service



The User Service manages user and employee-related information required by the application.



\### Responsibilities



\- User information

\- Employee information

\- User-related APIs

\- Employee lookup for department management



\*\*Port:\*\* `8082`



\---



\## Master Service



The Master Service provides master and reference data required by the application.



\*\*Port:\*\* `8083`



\---



\## Eureka Server



Eureka is used for \*\*service discovery\*\* between microservices.



It allows services to discover and communicate with each other without depending entirely on fixed service addresses.



\*\*Port:\*\* `8761`



\---



\## Config Server



The Config Server provides centralized configuration management for the microservices.



\*\*Port:\*\* `8888`



\---



\## MySQL



MySQL is used as the primary relational database for storing application data.



The Department Management database is:



```text

department\_management

