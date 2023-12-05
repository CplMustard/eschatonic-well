import CadreViewer from './CadreViewer';
import CardListViewer from './CardListViewer';
import ModelCardViewer from "./ModelCardViewer";
import CypherCardViewer from "./CypherCardViewer";
import EditorView from './EditorView';

const routes = [
    {
        path: "/",
        element: <EditorView />,
    },
    {
        path: "/force",
        element: <EditorView/>
    },
    {
        path: "/force/:forceId",
        element: <EditorView/>
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
    {
        path: "/cadre/:cadreId",
        element: <CadreViewer/>
    },
];

export default routes;