import App from './App';
import CardListViewer from './CardListViewer';
import ModelCardViewer from "./ModelCardViewer";
import CypherCardViewer from "./CypherCardViewer";
import ForceEditorView from './ForceEditorView';

const routes = [
    {
        path: "/",
        element: <ForceEditorView />,
    },
    {
        path: "/force",
        element: <ForceEditorView/>
    },
    {
        path: "/force/:forceID",
        element: <ForceEditorView/>
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