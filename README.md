# Project Title

TestOrg is an elegant solution to revolutionize the term “online test” in E-education. It's a platform that provides services concerning academic dimensions to the faculties and students.


## Deployment

This project has been already deployed at https://testorg-55.firebaseapp.com/

frontend git link : https://github.com/mahin-hossen/Testorg_backend.git

backend git link : https://github.com/Abir-islam-echo/Merged-TestOrg.git


## Tech Stack

**Client:** React, Redux, TailwindCSS

**Server:** Node, Express

**Database:** Mongodb



## Features

- Question Randomizer : Random Questions and Options for each Students from the categories set by the Teacher
- Exam Rooms : Individual exam room for each courses
- Data Analysis : Previous and Current data of all the rooms along with students
- Offline Result Generation : Offline result generation for each exam room
- Annual/semester Based report Generation : Report generation for every exam room


## Installation

Install TestOrg with npm

```bash
  npm install
```

After that for frontend

```bash
  npm start
```

for backend

```bash
  nodemon index
```

## Run Locally

Clone the project

```bash
  git clone https://github.com/mahin-hossen/Testorg_backend.git
```

```bash
  git clone https://github.com/Abir-islam-echo/Merged-TestOrg.git
```

Go to the project directory

```bash
  cd TestOrg
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start
```

## FAQ

#### How to recieve mail verification code again

Users can select resend mail button from login page. It will ask for email. After giving correct email, user will recieve verification mail again.

#### How Teacher can create exam

After logging in teacher can go to his profile and choose create room. This will redirect room creation page. From here teacher can create exam rooms

#### How Student can join room

After logging in student can go to join-room and from there he/she can join by respective room code given by teacher

#### How Teacher can watch past exam history

Teacher can go to his dashboard to watch past exam room performance
