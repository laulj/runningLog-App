# CS50 Final Project - Running Log App

#### Description:

Running Log is a final project submission with respect to **CS50’s Introduction to Computer Science**.

## Documentation

### Specifications

- **Landing**: Visitors who are not authenticated should see a landing page that introduces the application, summarises the features of the **Home**, **Chart**, and **Add** views, and offers the **Create Free Account** and **Sign In** actions.

- **Register & Login**: Users must be able to register new account and login with those that are already created.
- **Home**: For authenticated users, the **Home** button in the left navigation panel should display two components from a specific running strategy:

  - running log statistics containing the total distance travelled, the total time spent, and the average speed, and
  - a calendar to summarize the running statstics over the month.

  Furthermore, user should be able to toggle between different strategies and the aforementioned data should change accordingly.

- **Chart**: For authenticated users, the **Chart** button in the left navigation panel should display two components from a specific running strategy:
  - a histogram graphed with distance travelled againsts the date, and
  - the time to completion for each lap againsts the nth-lap is plotted for each log.
- **Add**: For authenticated users, the **Add** link in the left navigation panel display a view with three sections:
  - strategies, logs, and laps are displayed where each section:
    - displays the available strategies, logs, and laps respectively,
    - include the **add** and **delete** actions for each of the strategy, log, and lap.
    - Additionally, **add** action should be handle multiple entries per submit.
  - In the Log section, user should be able to switch between strategies to display the corresponding logs and laps, and
  - In the Lap section, user should be able to switch between logs to display the corresponding laps,
- **Dark theme**: User should be able to click on a button on the left navigation panel to switch between light and dark theme. The default theme should adapt the browser theme.

### Design Methodology

Running Log is a single page [React](https://react.dev/ "React") web application designed with [Ant Design](https://ant.design "Ant Design"), [Bootstrap 5](https://getbootstrap.com/ "Bootstrap 5"), and [Django](https://www.djangoproject.com/ "Django") backend along with [Django REST framework](https://www.django-rest-framework.org/ "Django REST framework").

### File Structure

- backend/
  - static/
  - templates/
  - forms.py # _Django modelforms_
  - storage_backend.py # _S3 Boto Storage class, declared to store static files to Amazon S3 bucket in production_
- frontend/ #_Create-react-app_
- media/ # _Dir. for media files_
- runningApp/ # _Django App_
  - jwt.py # _JSON Web Token utilities script_
- static/ # _Dir. for Django collected staticfiles_
- manage.py
- .gitignore
- LICENSE
- requirements.txt # _Package Dependencies_

## How to run the application

### Development

1.  While in the dir. `root`:
    1.      Create a virtual env, `python3 -m venv venv`,
    2.      Activate the venv, `source venv/bin/activate`,
    3.      Install the requirements, `pip3 install -r requirements.txt`,
2.  `cd` to dir. `frontend/`, run `npm install`,
3.  while in dir. `frontend/`, run `npm run collect` to collect the bundled static files to `static/`.
4.  Ensure DEBUG in settings.py is True. while in the dir. `root`, run:
    1.      `python3 manage.py makemigrations backend`,
    2.      `python3 manage.py migrate`, and
    3.      `python3 manage.py runserver`.

## File Functionality

A description of what is contained in each file.

### Frontend

1. Layout.js

The highest-level react component. While the user is not authenticated, it renders `LandingPage` instead of the app views, and the three menu items, **Home**, **Chart**, and **Add**, are only displayed once the user is logged in:

- **Home**: composed of `OverallStats` and `MyCalendar`,
- **Chart**: composed of `LogChart` and `LapChart`,
- **Add**: composed of `LogCreate` and `LapCreate`,

Nonetheless, `LoginForm` and `RegisterForm` to log and register user in respectively are also included.

2. LandingPage.js

`LandingPage` is displayed to visitors who are not logged in. It introduces the application with a hero section and the **Create Free Account** and **Sign In** actions, then summarises the features of the **Home**, **Chart**, and **Add** views along with the light and dark themes. The **Create Free Account** action opens the registration modal of `RegisterForm`, while **Sign In** opens the login dropdown in the header.

3. LoginForm.js

`LoginForm` is responsible for logging user in by acquiring the _access_ and _refresh_ token defined in `jwt.py`. Furthermore, if user chooses the _Remember me_ option, the choice will be stored in a React Hook, and refer to it again. In other words, if `loginStatus.remember` is not `false`, the username field in the login form will be pre-populated with the previous username.
Besides, if the user is authenticated, the returned _tokens_ will be stored in the _localStorage_.

4. RegisterForm.js

`RegisterForm` is a Modal component with frontend form validations written for user registration.

5. OverallStats.js

`OverallStats` is a React component to display the totalled statistics of a running strategy of

- total distance travelled in meters,
- total time spents in minutes, and
- average speed in kilometers per hour,

while the statistics are animated using `react-countup`. Furthermore, the aforementioned statistics will change as the selected running strategy changed.

6. Calendar.js

The purpose of `Calendar` is to provide an overview, and to summarize which day had the user exercised and the statistics on that day respectively.

7. LogChart.js

`LogChart` is a histogram implemented using `chart` and `react-chartjs-2` charted with the distance ran againsts the date to provide the user an overall view of the performance on each day. Furthermore, the histogram bar color is randomized using `faker`.

8. LapChart.js

Implemented using the same npm packages, but with a linear graph plotted with the time to complete each lap againsts the lap for each log.

9. StrategyCreate.js, LogCreate.js, LapCreate.js

`StrategyCreate`, `LogCreate`, and `LapCreate` are forms for adding and removing running strategies or plans, logs, and laps respectively.

### Backend

Django python files

1. models.py

- User:
  - Validate username and email in case-insensitive manner.
- Strategy:
  - Model to store user's running strategy information.
  - This allows user to conjure multiple strategies by adjusting the running pace, endurance, etc... to record the improvements.
  - Validate the "name" field with ASCIIUsernameValidator to eliminates all the other possible characters.
- Log:
  - Model to store user's running log, where each log represents one training session.
- Lap:
  - Optional. A model to store user's running lap, where each log could contain multiple laps. By recording the duration needed to complete each lap, user could understand the changes in pace between laps.

2. serializers.py

Model serializers for user, strategy, log, and lap.

#### API Route

- "api/token/" - Return `access` and `refresh` tokens if user is authentic.
- "api/register/" - To register a user.
- "api/strategy/" - If authenticated, return all strategies from the user.
- "api/strategy/id" - If authenticated, remove the strategy with id = id.
- "api/log/" - If authenticated, return all logs for a specific stragegy from the user.
- "api/log/id" - If authenticated, remove the log with id = id.
- "api/lap/" - If authenticated, return all laps for a specific log from the user.
- "api/lap/id" - If authenticated, remove the lap with id = id.
