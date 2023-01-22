import App from './App';
import CardListViewer from './CardListViewer';
import ModelCardViewer from "./ModelCardViewer";
import CypherCardViewer from "./CypherCardViewer";

const routes = [
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/lists",
        element: <CardListViewer/>
    },
    {
        path: "/lists/:listID",
        element: <CardListViewer/>
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
        path: "/racks",
        element: <CypherCardViewer/>
    },
    {
        path: "/racks/:rackID",
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