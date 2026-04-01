# PinPoint

*Downloaded from private repo so lost commits*
![](frontend/public/favicon.ico)
## About
- A mapping software to share your routes with your friends
- Pinpoint uses React, python-flask, Leaflet mapping and Stripe payments

## Running the App
- For full process see our [guide on the wiki](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-7/wiki/Getting-started-with-environments,-Flask,-React-and-Git)
```
git clone git@github.com:uol-feps-soc-comp2913-2324s2-classroom/team-project-team-7.git
```
- Backend and frontend will need to be run on seperate teminal sessions
- In `team-project-team-7/backend` , once in a vm with the requirements installed, run:
```
python run.py
```
- In `team-project-team-7/frontend`, with requirements intalled, run:
```
npm start
```
- We have a script at the bottom of the [wiki page](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-7/wiki/Getting-started-with-environments,-Flask,-React-and-Git) to start the app from 1 command (requires tmux)

## Contributing
- Please report issues in the issue tracker and when solving an issue please use the issue code in the branch name
- Use the [git guide](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-7/wiki/Git) for standards on branching, commiting changes and creating PRs
- Track progress of each branch on the relevant [project page](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-7/projects?query=is%3Aopen)

## Testing
- Backend testing is ran in docker using pytest
- Frontend testing is ran using the jest framework
- On every push we use github actions to test that the code still runs and that there are no major flaws

## User Usage
### Landing Page
![image](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-7/assets/81157052/1d79796d-4467-41da-b073-6eb338288ece)
From here you can create an account or log in to an existing one, it also scrolls to display more information and shows an example map
### Subscriptions
![image](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-7/assets/81157052/392f7865-1caf-4b02-9826-5a6018544ad8)
Here you can select your subscription type, without a subscription you can only change your account details but cannot access the map or see your frineds maps.
### The Map
![image](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-7/assets/81157052/c5d2ee84-de51-4312-bb4f-5919a39fa4f5)
You and your friends routes are on the left and you can change the map view on the right side
### Adding Friends
![image](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-7/assets/81157052/c82a01f0-c3d7-44f0-9365-6d314acb48a0)
### Managing Account
![image](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-7/assets/81157052/db5c1c4d-56fe-482f-8557-f1df2bdc2db2)

## Manager Views
### Users
![image](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-7/assets/124159165/412b7aae-7b6f-4317-ac61-4f8226d56c5d)
### Projections
![image](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-7/assets/124159165/64ad1ec7-b138-4818-8764-629fd6fb3d67)



## Useful Links
[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/Nrqv5LcV)  <br> 
[Web Dev Coursework](https://alt-6100e9398f586.blackboard.com/bbcswebdav/courses/202223_35759_COMP2913/site/)


