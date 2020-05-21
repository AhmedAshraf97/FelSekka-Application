const graphlib = require('graphlib');

function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function getShortestPath(g, source, sink) {

    let weightFunc = (e) => g.edge(e);
    let edgeFunc
    let dijkstra = graphlib.alg.dijkstra(g, source, weightFunc, edgeFunc);
    if (dijkstra[sink].distance === Number.POSITIVE_INFINITY) {
        return null;
    }

    let edges = [];
    let currentNode = sink;
    while (currentNode !== source) {
        let previousNode = dijkstra[currentNode].predecessor;
        let weightValue = g.edge(previousNode, currentNode)
        let edge = {
            fromNode: previousNode,
            toNode: currentNode,
            weight: weightValue
        }
        edges.push(edge);
        currentNode = previousNode;
    }

    let result = {
        totalCost: dijkstra[sink].distance,
        edges: edges.reverse()
    };
    return result;
}


function removeNode(g, RemovedNode) {

    let removedEdges = [];
    let edges = cloneObject(g.edges());
    for (edge of edges) {
        if (edge.v == RemovedNode || edge.w == RemovedNode) {
            let weightValue = g.edge(edge);
            removedEdges.push({
                fromNode: edge.v,
                toNode: edge.w,
                weight: weightValue
            });
        }
    }
    g.removeNode(RemovedNode);
    return removedEdges;
}

function isPathEqual(path1, path2) {
    if (path1 == null || path2 == null) {
        return false;
    }

    if (path1.edges.length != path2.edges.length) {
        return false;
    }

    for (let i = 0; i < path1.edges.length; i++) {

        if (path1.edges[i].fromNode != path2.edges[i].fromNode) {
            return false;
        }
        if (path1.edges[i].toNode != path2.edges[i].toNode) {
            return false;
        }
    }

    return true;
}

function getRootPath(path, i) {
    let newPath = cloneObject(path);
    let edges = [];
    if (i > path.edges.length) {
        i = 1;
    }
    for (let j = 0; j < i; j++) {
        edges.push(path.edges[j]);
    }
    newPath.totalCost = 0;
    for (edge of edges) {
        newPath.totalCost += edge.weight;
    }
    newPath.edges = edges;
    return newPath;
}


function PathInB(B, path) {
    var flag = false;
    for (candidate of B) {
        if (isPathEqual(candidate, path)) {
            flag = true;
            break;
        }

    }
    return flag;
}
exports.yenKSP = function(g, source, sink, K, constraint1, constraint2) {

    let clonedGraph = graphlib.json.read(graphlib.json.write(g));

    let A = [];
    let B = [];
    let kthPath;

    let firstShortestPath = getShortestPath(clonedGraph, source, sink);
    if (!firstShortestPath) {
        return A;
    }
    if (kthPath > constraint1 || kthPath > constraint2) {
        return null;
    }

    A.push(firstShortestPath);

    for (let k = 1; k < K; k++) {
        let previousShortestPath = cloneObject(A[k - 1]);

        if (!previousShortestPath) {
            break;
        }


        for (let i = 0; i < previousShortestPath.edges.length; i++) {


            let removedEdges = [];

            let spurNode = previousShortestPath.edges[i].fromNode;

            let rootPath = getRootPath(previousShortestPath, i);

            for (path of A) {
                path = cloneObject(path);
                if (isPathEqual(rootPath, getRootPath(path, i))) {
                    clonedGraph.removeEdge(path.edges[i].fromNode, path.edges[i].toNode);
                    removedEdges.push(path.edges[i]);
                }
            }

            for (rootPathEdge of rootPath.edges) {
                let RemovedNode = rootPathEdge.fromNode;
                if (RemovedNode !== spurNode) {
                    let removedEdgeFromNode = removeNode(clonedGraph, RemovedNode);
                    removedEdges.push(...removedEdgeFromNode);
                }

            }
            let spurPath = getShortestPath(clonedGraph, spurNode, sink);

            if (spurPath != null) {
                let totalPath = cloneObject(rootPath);
                let edgesToAdd = cloneObject(spurPath.edges);
                totalPath.edges.push(...edgesToAdd);
                totalPath.totalCost += spurPath.totalCost;
                if (!PathInB(B, totalPath)) {
                    B.push(totalPath);
                }
            }


            for (e of removedEdges) {
                clonedGraph.setEdge(e.fromNode, e.toNode, e.weight);
            }
        }
        kthPath = B.sort((a, b) => a.totalCost - b.totalCost).shift();

        if (kthPath == null) {
            break;
        }
        if (kthPath.totalCost > constraint1 || kthPath.totalCost > constraint2) {
            return A;
        }
        A.push(kthPath);
    }
    return A;
}