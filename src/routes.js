import App from './App';
import CardListViewer from './CardListViewer';
import ModelCardViewer from "./ModelCardViewer";
import CypherCardViewer from "./CypherCardViewer";
import ForceEditor from './ForceEditor';

const routes = [
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/force",
        element: <ForceEditor/>
    },
    {
        path: "/force/:forceID",
        element: <ForceEditor/>
    },
    {
        path: "/matches",
        element: <CardListViewer/>
    },
    {
        path: "/matches/:matchID",
        element: <CardListViewer/>
    },
    {
        path: "/rack",
        element: <CypherCardViewer/>
    },
    {
        path: "/rack/:rackID",
        element: <CypherCardViewer/>
    },
    {
        path: "/cards",
        element: <CardListViewer/>
    },
    {
        path: "/cards/:factionID",
        element: <CardListViewer/>
    },
    {
        path: "/model/:modelID",
        element: <ModelCardViewer/>
    },
    {
        path: "/cypher/:cypherID",
        element: <CypherCardViewer/>
    },
];

export default routes;