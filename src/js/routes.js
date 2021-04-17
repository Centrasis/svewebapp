
import HomePage from '../pages/home';
import MediaHomePage from '../pages/SVEMediaHome';
import AboutPage from '../pages/about.jsx';
import FormPage from '../pages/form.jsx';
import DocsPage from '../pages/docs.jsx';
import ProjectPage from '../pages/project.jsx';
import ContextPage from '../pages/context';
import SettingsPage from '../pages/settings';
import UsersPage from '../pages/users.jsx';
import ProjectdetailsPage from '../pages/projectDetails.jsx';
import ContextdetailsPage from '../pages/contextDetails';

import DynamicRoutePage from '../pages/dynamic-route.jsx';
import LoginScreen, { LoginType } from '../pages/LoginScreen';
import NotFoundPage from '../pages/404.jsx';
import PlayGame from '../pages/playGame.jsx';
import GameHub from '../pages/gameHub.jsx';
import { SideMenue } from '../components/SideMenue';
import store from '../components/store';
import { LoginHook } from '../components/LoginHook';

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
    path: '/playgame/:game/:id/:isHost',
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
    beforeLeave: ({resolve, reject}) => {
      SideMenue.popRightPanel();
      resolve();
    }
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
    beforeLeave: ({resolve, reject}) => {
      SideMenue.popRightPanel();
      resolve();
    }
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
