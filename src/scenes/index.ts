import { registerScene } from './SceneRegistry';
import { arrayBarDef } from './AbstractScenes/ArrayBarVisualizer';
import { graphAbstractDef } from './AbstractScenes/GraphAbstract';
import { matrixAbstractDef } from './AbstractScenes/MatrixAbstract';
import { treeAbstractDef } from './AbstractScenes/TreeAbstract';
import { searchAbstractDef } from './AbstractScenes/SearchAbstract';
import { stringAbstractDef } from './AbstractScenes/StringAbstract';
import { sortingFactoryDef } from './EngineeringScenes/SortingFactory';
import { pathMapDef } from './EngineeringScenes/PathMap';
import { assemblyLineDef } from './EngineeringScenes/AssemblyLine';
import { mazeDef } from './EngineeringScenes/Maze';
import { librarySearchDef } from './EngineeringScenes/LibrarySearch';
import { documentMatchDef } from './EngineeringScenes/DocumentMatch';
import { sortingSceneDef } from './EngineeringScenes/SortingScene';
import { graphSceneDef } from './EngineeringScenes/GraphScene';
import { dpSceneDef } from './EngineeringScenes/DPScene';
import { treeSceneDef } from './EngineeringScenes/TreeScene';
import { searchSceneDef } from './EngineeringScenes/SearchScene';
import { stringSceneDef } from './EngineeringScenes/StringScene';

export function initScenes(): void {
  // Abstract scenes (generic)
  registerScene(arrayBarDef);
  registerScene(graphAbstractDef);
  registerScene(matrixAbstractDef);
  registerScene(treeAbstractDef);
  registerScene(searchAbstractDef);
  registerScene(stringAbstractDef);

  // Engineering scenes (generic - lower priority)
  registerScene({ ...sortingFactoryDef, priority: 10 });
  registerScene({ ...pathMapDef, priority: 10 });
  registerScene({ ...assemblyLineDef, priority: 10 });
  registerScene({ ...mazeDef, priority: 10 });
  registerScene({ ...librarySearchDef, priority: 10 });
  registerScene({ ...documentMatchDef, priority: 10 });

  // Engineering scenes (specialized - higher priority)
  registerScene(sortingSceneDef);
  registerScene(graphSceneDef);
  registerScene(dpSceneDef);
  registerScene(treeSceneDef);
  registerScene(searchSceneDef);
  registerScene(stringSceneDef);
}

export { resolveScene } from './SceneRegistry';
