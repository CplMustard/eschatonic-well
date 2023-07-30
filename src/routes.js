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
        path: "/force/:forceId",
        element: <ForceEditorView/>
    },
    {
        path: "/matches",
        element: <CardListViewer/>
    },
    {
        path: "/matches/:matchId",
        element: <CardListViewer/>
    },
    {
        path: "/rack",
        element: <CypherCardViewer/>
    },
    {
        path: "/rack/:rackId",
        element: <CypherCardViewer/>
    },
    {
        path: "/cards",
        element: <CardListViewer/>
    },
    {
        path: "/cards/:factionId",
        element: <CardListViewer/>
    },
    {
        path: "/model/:modelId",
        element: <ModelCardViewer/>
    },
    {
        path: "/cypher/:cypherId",
        element: <CypherCardViewer/>
    },
];

export default routes;