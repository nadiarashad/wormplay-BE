# Wormplay backend

## Instructions

This backend is live on [Heroku](https://wormplayserver.herokuapp.com/).
<br/>
The frontend counterpart repository can be found [here](https://github.com/chicorycolumn/wormplay-FE).
<br/>
The live site is on [Netlify](https://wormplay.netlify.app/).
<br/>
You can also download this repository and run the project locally by following these steps:

1. Fork this repository by clicking the button labelled 'Fork' on the [project page](https://github.com/nadiarashad/wormplay-BE).
   <br/>
   Copy the url of your forked copy of the repository, and run `git clone the_url_of_your_forked_copy` in a Terminal window on your computer, replacing the long underscored word with your url.
   <br/>
   If you are unsure, instructions on forking can be found [here](https://guides.github.com/activities/forking/) or [here](https://www.toolsqa.com/git/git-fork/), and cloning [here](https://www.wikihow.com/Clone-a-Repository-on-Github) or [here](https://www.howtogeek.com/451360/how-to-clone-a-github-repository/).

2. Open the project in a code editor, and run `npm install` to install necessary packages. You may also need to install [Node.js](https://nodejs.org/en/) by running `npm install node.js`.

3. Run `npm start` to open the project in development mode.
   <br/>
   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Deploy

General instructions for hosting on **Heroku** for **automatic deployment** are as follows:

0. Ensure the project is initialised in a Git repository. If you are unsure what this means, instructions can be found [here](https://medium.com/@JinnaBalu/initialize-local-git-repository-push-to-the-remote-repository-787f83ff999) and [here](https://www.theserverside.com/video/How-to-create-a-local-repository-with-the-git-init-command).

1. Install the Heroku CLI if not already, with `npm install heroku`.

2. Run these three commands:

- `heroku login`
- `heroku create my-awesome-app`
- `heroku git:remote -a my-awesome-app`

3. Login to Heroku and enable automatic deploys from Github, and connect the repo.

Now when you commit and push to Github, Heroku will deploy the latest version of the project automatically.

## Description

An online two-player word game that uses webcam for facial recognition. Upon entering the lobby, players can pull faces to represent four different emotions at their webcam, and the emotion recognition API detects which emotion is being expressed, and takes a photo at the correct moment. These photos of the player's own face are transferred onto the 'word worm' - a 2D physics object that crawls around the screen - onto which the player drops Scrabble tiles to spell out words and get points against their opponent, who is doing the same.

This was the final project at Northcoders, and was thought of, designed, developed, and tested all within two weeks. The project started just at the beginning of the Covid-19 lockdown in the UK, and so the team of four collaborated entirely remotely, using Trello as a kanban board, daily standups, and Agile method throughout.

## The Team

[James Johnson](https://github.com/Brork)
<br/>
[Patrick Mackridge](https://github.com/PatrickMackridge)
<br/>
[Chris Matus](https://github.com/chicorycolumn)
<br/>
[Nadia Rashad](https://github.com/nadiarashad)

The team's presentation can be found [here](https://www.youtube.com/watch?v=NdILlpRjQAg).
