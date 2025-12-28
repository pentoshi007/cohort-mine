import { RecoilRoot, atom, selector, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { networkAtom, jobsAtom, messagingAtom, notificationsAtom } from './11.3-atoms';

// Selector to calculate total notifications across all categories
const totalNotificationsSelector = selector({
    key: 'totalNotifications',
    get: ({ get }) => {
        const network = get(networkAtom);
        const jobs = get(jobsAtom);
        const messaging = get(messagingAtom);
        const notifications = get(notificationsAtom);
        return network + jobs + messaging + notifications;
    }
});

function App() {
    //earlier we would define 4 states for each button and then use them in the component
    //now with Recoil, we can use atoms and selectors to manage state globally
    return <>
        <RecoilRoot>
            <MainApp />
        </RecoilRoot>
    </>
}

function MainApp() {
    const network = useRecoilValue(networkAtom);
    const jobs = useRecoilValue(jobsAtom);
    const messaging = useRecoilValue(messagingAtom);
    const notifications = useRecoilValue(notificationsAtom);
    const totalNotifications = useRecoilValue(totalNotificationsSelector);

    return <>
        <button>Home</button>
        <button>My network ({network > 100 ? "99+" : network})</button>
        <button>Jobs ({jobs})</button>
        <button>Messaging ({messaging})</button>
        <button>Notifications ({notifications})</button>
        <button>Me</button>
        <button>Total Notifications: {totalNotifications}</button>
        <ButtonUpdater />
    </>
}

// Component to update notification counts
function ButtonUpdater() {
    const setNetwork = useSetRecoilState(networkAtom);
    const setJobs = useSetRecoilState(jobsAtom);
    const setMessaging = useSetRecoilState(messagingAtom);
    const setNotifications = useSetRecoilState(notificationsAtom);

    return (
        <div style={{ marginTop: '20px' }}>
            <button onClick={() => setNetwork(n => n + 1)}>Increase Network</button>
            <button onClick={() => setJobs(j => j + 1)}>Increase Jobs</button>
            <button onClick={() => setMessaging(m => m + 1)}>Increase Messaging</button>
            <button onClick={() => setNotifications(n => n + 1)}>Increase Notifications</button>
        </div>
    );
}

export default App;