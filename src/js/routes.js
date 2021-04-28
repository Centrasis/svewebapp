
import HomePage from '../pages/home';
import MediaHomePage from '../pages/SVEMediaHome';
import AboutPage from '../pages/about.jsx';
import FormPage from '../pages/form.jsx';
import DocsPage from '../pages/docs';
import ProjectPage from '../pages/project';
import ContextPage from '../pages/context';
import SettingsPage from '../pages/settings';
import UsersPage from '../pages/users';
import ProjectdetailsPage from '../pages/projectDetails';
import ContextdetailsPage from '../pages/contextDetails';

import DynamicRoutePage from '../pages/dynamic-route.jsx';
import LoginScreen, { LoginType } from '../pages/LoginScreen';
import NotFoundPage from '../pages/404.jsx';
import PlayGame from '../pages/playGame';
import GameHub from '../pages/gameHub';

var routes = [
  {
    path: '/',
    component: HomePage,
    options: {
      transition: 'f7-dive',
    },
  },
  {
    path: '/mediahome/',
    component: MediaHomePage,
    options: {
      transition: 'f7-dive',
    }
  },
  {
    path: '/login/',
    component: LoginScreen,
    options: {
      transition: 'f7-cover-v',
      props: {
        type: LoginType.Login,
      },
    },
  },
  {
    path: '/register/:token',
    component: LoginScreen,
    options: {
      transition: 'f7-cover-v',
      props: {
        type: LoginType.Register,
      },
    },
  },
  {
    path: '/about/',
    component: AboutPage,
    options: {
      transition: 'f7-dive',
    },
  },
  {
    path: '/playgame/:id/:isHost',
    component: PlayGame,
    options: {
      transition: 'f7-dive',
    },
  },
  {
    path: '/gamehub/',
    component: GameHub,
    options: {
      transition: 'f7-dive',
    },
  },
  {
    path: '/api1Repo/',
    url: "https://www.felixlehner.de:3000/root/sve-api-1.0",
    options: {
      transition: 'f7-dive',
    },
  },
  {
    path: '/api2Repo/',
    url: "https://www.felixlehner.de:3000/root/sve-api-2.0",
    options: {
      transition: 'f7-dive',
    },
  },
  {
    path: '/form/',
    component: FormPage,
    options: {
      transition: 'f7-dive',
    },
  },
  {
    path: '/docs/',
    component: DocsPage,
    options: {
      transition: 'f7-dive',
    },
  },
  {
    path: '/project/:id/',
    component: ProjectPage,
    options: {
      transition: 'f7-push',
    },
  },
  {
    path: '/projectdetails/:id/',
    component: ProjectdetailsPage,
    options: {
      transition: 'f7-push',
    },
  },
  {
    path: '/contextdetails/:id/',
    component: ContextdetailsPage,
    options: {
      transition: 'f7-push',
    },
  },
  {
    path: '/context/:id/',
    component: ContextPage,
    options: {
      transition: 'f7-push',
    },
  },
  {
    path: '/users/:id/',
    component: UsersPage,
    options: {
      transition: 'f7-push',
    },
  },
  {
    path: '/settings/',
    component: SettingsPage,
    options: {
      transition: 'f7-dive',
    },
  },

  {
    path: '/dynamic-route/blog/:blogId/post/:postId/',
    component: DynamicRoutePage,
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;
