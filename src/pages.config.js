import Home from './pages/Home';
import SetupAccount from './pages/SetupAccount';
import Dashboard from './pages/Dashboard';
import StudentTasks from './pages/StudentTasks';
import RewardStore from './pages/RewardStore';
import Investments from './pages/Investments';
import AIAssistant from './pages/AIAssistant';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import CreateTask from './pages/CreateTask';
import GradeTasks from './pages/GradeTasks';
import ExerciseBank from './pages/ExerciseBank';
import MiniGame from './pages/MiniGame';
import StudentsList from './pages/StudentsList';
import PastTasks from './pages/PastTasks';
import Ranking from './pages/Ranking';
import Tutorial from './pages/Tutorial';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "SetupAccount": SetupAccount,
    "Dashboard": Dashboard,
    "StudentTasks": StudentTasks,
    "RewardStore": RewardStore,
    "Investments": Investments,
    "AIAssistant": AIAssistant,
    "Profile": Profile,
    "Onboarding": Onboarding,
    "CreateTask": CreateTask,
    "GradeTasks": GradeTasks,
    "ExerciseBank": ExerciseBank,
    "MiniGame": MiniGame,
    "StudentsList": StudentsList,
    "PastTasks": PastTasks,
    "Ranking": Ranking,
    "Tutorial": Tutorial,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};