import {WorkTagMap} from './reactDevToolsTypes';
import {compareVersions} from 'compare-versions';
import {ReactComponentInfo} from './reactDevToolsTypes';

// Migrated from react-devtools-shared/src/backend/utils/index.js
export function gt(a: string = '', b: string = ''): boolean {
  return compareVersions(a, b) === 1;
}

export function gte(a: string = '', b: string = ''): boolean {
  return compareVersions(a, b) > -1;
}

// Migrated from react-devtools-shared/src/utils.js
const cachedDisplayNames: WeakMap<Function, string> = new WeakMap();

export function getWrappedDisplayName(
  outerType: any,
  innerType: any,
  wrapperName: string,
  fallbackName: string = 'Anonymous',
): string {
  const displayName = outerType?.displayName;
  return (
    displayName || `${wrapperName}(${getDisplayName(innerType, fallbackName)})`
  );
}

export function getDisplayName(
  type: any,
  fallbackName: string = 'Anonymous',
): string {
  const nameFromCache = cachedDisplayNames.get(type);
  if (nameFromCache != null) {
    return nameFromCache;
  }

  let displayName = fallbackName;

  // The displayName property is not guaranteed to be a string.
  // It's only safe to use for our purposes if it's a string.
  if (typeof type.displayName === 'string') {
    displayName = type.displayName;
  } else if (typeof type.name === 'string' && type.name !== '') {
    displayName = type.name;
  }

  cachedDisplayNames.set(type, displayName);
  return displayName;
}

// Migrated from react-devtools-shared/src/backend/shared/DevToolsServerComponentLogs.js
type ComponentLogs = {
  errors: Map<string, number>;
  errorsCount: number;
  warnings: Map<string, number>;
  warningsCount: number;
};

// This keeps it around as long as the ComponentInfo is alive which
// lets the Fiber get reparented/remounted and still observe the previous errors/warnings.
// Unless we explicitly clear the logs from a Fiber.
export const componentInfoToComponentLogsMap: WeakMap<
  ReactComponentInfo,
  ComponentLogs
> = new WeakMap();

// Migrated from shared/objectIs.js
/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function isPolyfill(x: any, y: any) {
  return (
    (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y) // eslint-disable-line no-self-compare
  );
}

export const is: (x: any, y: any) => boolean =
  typeof Object.is === 'function' ? Object.is : isPolyfill;

// Migrated from shared/hasOwnProperty.js
export const hasOwnProperty = Object.prototype.hasOwnProperty;
import {
  MEMO_NUMBER,
  MEMO_SYMBOL_STRING,
  FORWARD_REF_NUMBER,
  FORWARD_REF_SYMBOL_STRING,
  REACT_MEMO_CACHE_SENTINEL,
  CONCURRENT_MODE_NUMBER,
  CONCURRENT_MODE_SYMBOL_STRING,
  DEPRECATED_ASYNC_MODE_SYMBOL_STRING,
  PROVIDER_NUMBER,
  PROVIDER_SYMBOL_STRING,
  CONTEXT_NUMBER,
  CONTEXT_SYMBOL_STRING,
  SERVER_CONTEXT_SYMBOL_STRING,
  CONSUMER_SYMBOL_STRING,
  STRICT_MODE_NUMBER,
  STRICT_MODE_SYMBOL_STRING,
  PROFILER_NUMBER,
  PROFILER_SYMBOL_STRING,
  SCOPE_NUMBER,
  SCOPE_SYMBOL_STRING,
} from './reactDevToolsSymbols';
import {Fiber} from './reactDevToolsTypes';

// Migrated from react-devtools-shared/src/utils.js
let uidCounter: number = 0;

export function getUID(): number {
  return ++uidCounter;
}

export function utfEncodeString(string: string): Array<number> {
  const encoded = [];
  let i = 0;
  let charCode;
  while (i < string.length) {
    charCode = string.charCodeAt(i);
    // Handle multibyte unicode characters (like emoji).
    if ((charCode & 0xf800) === 0xd800) {
      encoded.push(surrogatePairToCodePoint(charCode, string.charCodeAt(++i)));
    } else {
      encoded.push(charCode);
    }
    ++i;
  }
  return encoded;
}

function surrogatePairToCodePoint(
  charCode1: number,
  charCode2: number,
): number {
  return ((charCode1 & 0x3ff) << 10) + (charCode2 & 0x3ff) + 0x10000;
}

// Migrated from react-reconciler/src/ReactFiberDevToolsHook.js
export function injectProfilingHooks(profilingHooks: any): void {
  // This is a simplified version of the function from ReactFiberDevToolsHook.js
  // We're only implementing the bare minimum needed for the current use case
}

type getDisplayNameForFiberType = (fiber: Fiber) => string | null;
type getTypeSymbolType = (type: any) => symbol | string | number;

type ReactPriorityLevelsType = {
  ImmediatePriority: number;
  UserBlockingPriority: number;
  NormalPriority: number;
  LowPriority: number;
  IdlePriority: number;
  NoPriority: number;
};

export function getInternalReactConstants(version: string): {
  getDisplayNameForFiber: getDisplayNameForFiberType;
  getTypeSymbol: getTypeSymbolType;
  ReactPriorityLevels: ReactPriorityLevelsType;
  ReactTypeOfWork: WorkTagMap;
  StrictModeBits: number;
} {
  // **********************************************************
  // The section below is copied from files in React repo.
  // Keep it in sync, and add version guards if it changes.
  //
  // Technically these priority levels are invalid for versions before 16.9,
  // but 16.9 is the first version to report priority level to DevTools,
  // so we can avoid checking for earlier versions and support pre-16.9 canary releases in the process.
  let ReactPriorityLevels: ReactPriorityLevelsType = {
    ImmediatePriority: 99,
    UserBlockingPriority: 98,
    NormalPriority: 97,
    LowPriority: 96,
    IdlePriority: 95,
    NoPriority: 90,
  };

  if (gt(version, '17.0.2')) {
    ReactPriorityLevels = {
      ImmediatePriority: 1,
      UserBlockingPriority: 2,
      NormalPriority: 3,
      LowPriority: 4,
      IdlePriority: 5,
      NoPriority: 0,
    };
  }

  let StrictModeBits = 0;
  if (gte(version, '18.0.0-alpha')) {
    // 18+
    StrictModeBits = 0b011000;
  } else if (gte(version, '16.9.0')) {
    // 16.9 - 17
    StrictModeBits = 0b1;
  } else if (gte(version, '16.3.0')) {
    // 16.3 - 16.8
    StrictModeBits = 0b10;
  }

  let ReactTypeOfWork: WorkTagMap = {} as WorkTagMap;

  // **********************************************************
  // The section below is copied from files in React repo.
  // Keep it in sync, and add version guards if it changes.
  //
  // TODO Update the gt() check below to be gte() whichever the next version number is.
  // Currently the version in Git is 17.0.2 (but that version has not been/may not end up being released).
  if (gt(version, '17.0.1')) {
    ReactTypeOfWork = {
      CacheComponent: 24, // Experimental
      ClassComponent: 1,
      ContextConsumer: 9,
      ContextProvider: 10,
      CoroutineComponent: -1, // Removed
      CoroutineHandlerPhase: -1, // Removed
      DehydratedSuspenseComponent: 18, // Behind a flag
      ForwardRef: 11,
      Fragment: 7,
      FunctionComponent: 0,
      HostComponent: 5,
      HostPortal: 4,
      HostRoot: 3,
      HostHoistable: 26, // In reality, 18.2+. But doesn't hurt to include it here
      HostSingleton: 27, // Same as above
      HostText: 6,
      IncompleteClassComponent: 17,
      IncompleteFunctionComponent: 28,
      IndeterminateComponent: 2, // removed in 19.0.0
      LazyComponent: 16,
      LegacyHiddenComponent: 23,
      MemoComponent: 14,
      Mode: 8,
      OffscreenComponent: 22, // Experimental
      Profiler: 12,
      ScopeComponent: 21, // Experimental
      SimpleMemoComponent: 15,
      SuspenseComponent: 13,
      SuspenseListComponent: 19, // Experimental
      TracingMarkerComponent: 25, // Experimental - This is technically in 18 but we don't
      // want to fork again so we're adding it here instead
      YieldComponent: -1, // Removed
      Throw: 29,
      ViewTransitionComponent: 30, // Experimental
      ActivityComponent: 31,
    };
  } else if (gte(version, '17.0.0-alpha')) {
    ReactTypeOfWork = {
      CacheComponent: -1, // Doesn't exist yet
      ClassComponent: 1,
      ContextConsumer: 9,
      ContextProvider: 10,
      CoroutineComponent: -1, // Removed
      CoroutineHandlerPhase: -1, // Removed
      DehydratedSuspenseComponent: 18, // Behind a flag
      ForwardRef: 11,
      Fragment: 7,
      FunctionComponent: 0,
      HostComponent: 5,
      HostPortal: 4,
      HostRoot: 3,
      HostHoistable: -1, // Doesn't exist yet
      HostSingleton: -1, // Doesn't exist yet
      HostText: 6,
      IncompleteClassComponent: 17,
      IncompleteFunctionComponent: -1, // Doesn't exist yet
      IndeterminateComponent: 2,
      LazyComponent: 16,
      LegacyHiddenComponent: 24,
      MemoComponent: 14,
      Mode: 8,
      OffscreenComponent: 23, // Experimental
      Profiler: 12,
      ScopeComponent: 21, // Experimental
      SimpleMemoComponent: 15,
      SuspenseComponent: 13,
      SuspenseListComponent: 19, // Experimental
      TracingMarkerComponent: -1, // Doesn't exist yet
      YieldComponent: -1, // Removed
      Throw: -1, // Doesn't exist yet
      ViewTransitionComponent: -1, // Doesn't exist yet
      ActivityComponent: -1, // Doesn't exist yet
    };
  } else if (gte(version, '16.6.0-beta.0')) {
    ReactTypeOfWork = {
      CacheComponent: -1, // Doesn't exist yet
      ClassComponent: 1,
      ContextConsumer: 9,
      ContextProvider: 10,
      CoroutineComponent: -1, // Removed
      CoroutineHandlerPhase: -1, // Removed
      DehydratedSuspenseComponent: 18, // Behind a flag
      ForwardRef: 11,
      Fragment: 7,
      FunctionComponent: 0,
      HostComponent: 5,
      HostPortal: 4,
      HostRoot: 3,
      HostHoistable: -1, // Doesn't exist yet
      HostSingleton: -1, // Doesn't exist yet
      HostText: 6,
      IncompleteClassComponent: 17,
      IncompleteFunctionComponent: -1, // Doesn't exist yet
      IndeterminateComponent: 2,
      LazyComponent: 16,
      LegacyHiddenComponent: -1,
      MemoComponent: 14,
      Mode: 8,
      OffscreenComponent: -1, // Experimental
      Profiler: 12,
      ScopeComponent: -1, // Experimental
      SimpleMemoComponent: 15,
      SuspenseComponent: 13,
      SuspenseListComponent: 19, // Experimental
      TracingMarkerComponent: -1, // Doesn't exist yet
      YieldComponent: -1, // Removed
      Throw: -1, // Doesn't exist yet
      ViewTransitionComponent: -1, // Doesn't exist yet
      ActivityComponent: -1, // Doesn't exist yet
    };
  } else if (gte(version, '16.4.3-alpha')) {
    ReactTypeOfWork = {
      CacheComponent: -1, // Doesn't exist yet
      ClassComponent: 2,
      ContextConsumer: 11,
      ContextProvider: 12,
      CoroutineComponent: -1, // Removed
      CoroutineHandlerPhase: -1, // Removed
      DehydratedSuspenseComponent: -1, // Doesn't exist yet
      ForwardRef: 13,
      Fragment: 9,
      FunctionComponent: 0,
      HostComponent: 7,
      HostPortal: 6,
      HostRoot: 5,
      HostHoistable: -1, // Doesn't exist yet
      HostSingleton: -1, // Doesn't exist yet
      HostText: 8,
      IncompleteClassComponent: -1, // Doesn't exist yet
      IncompleteFunctionComponent: -1, // Doesn't exist yet
      IndeterminateComponent: 4,
      LazyComponent: -1, // Doesn't exist yet
      LegacyHiddenComponent: -1,
      MemoComponent: -1, // Doesn't exist yet
      Mode: 10,
      OffscreenComponent: -1, // Experimental
      Profiler: 15,
      ScopeComponent: -1, // Experimental
      SimpleMemoComponent: -1, // Doesn't exist yet
      SuspenseComponent: 16,
      SuspenseListComponent: -1, // Doesn't exist yet
      TracingMarkerComponent: -1, // Doesn't exist yet
      YieldComponent: -1, // Removed
      Throw: -1, // Doesn't exist yet
      ViewTransitionComponent: -1, // Doesn't exist yet
      ActivityComponent: -1, // Doesn't exist yet
    };
  } else {
    ReactTypeOfWork = {
      CacheComponent: -1, // Doesn't exist yet
      ClassComponent: 2,
      ContextConsumer: 12,
      ContextProvider: 13,
      CoroutineComponent: 7,
      CoroutineHandlerPhase: 8,
      DehydratedSuspenseComponent: -1, // Doesn't exist yet
      ForwardRef: 14,
      Fragment: 10,
      FunctionComponent: 1,
      HostComponent: 5,
      HostPortal: 4,
      HostRoot: 3,
      HostHoistable: -1, // Doesn't exist yet
      HostSingleton: -1, // Doesn't exist yet
      HostText: 6,
      IncompleteClassComponent: -1, // Doesn't exist yet
      IncompleteFunctionComponent: -1, // Doesn't exist yet
      IndeterminateComponent: 0,
      LazyComponent: -1, // Doesn't exist yet
      LegacyHiddenComponent: -1,
      MemoComponent: -1, // Doesn't exist yet
      Mode: 11,
      OffscreenComponent: -1, // Experimental
      Profiler: 15,
      ScopeComponent: -1, // Experimental
      SimpleMemoComponent: -1, // Doesn't exist yet
      SuspenseComponent: 16,
      SuspenseListComponent: -1, // Doesn't exist yet
      TracingMarkerComponent: -1, // Doesn't exist yet
      YieldComponent: 9,
      Throw: -1, // Doesn't exist yet
      ViewTransitionComponent: -1, // Doesn't exist yet
      ActivityComponent: -1, // Doesn't exist yet
    };
  }
  // **********************************************************
  // End of copied code.
  // **********************************************************

  function getTypeSymbol(type: any): symbol | string | number {
    const symbolOrNumber =
      typeof type === 'object' && type !== null ? type.$$typeof : type;

    return typeof symbolOrNumber === 'symbol'
      ? symbolOrNumber.toString()
      : symbolOrNumber;
  }

  const {
    CacheComponent,
    ClassComponent,
    IncompleteClassComponent,
    IncompleteFunctionComponent,
    FunctionComponent,
    IndeterminateComponent,
    ForwardRef,
    HostRoot,
    HostHoistable,
    HostSingleton,
    HostComponent,
    HostPortal,
    HostText,
    Fragment,
    LazyComponent,
    LegacyHiddenComponent,
    MemoComponent,
    OffscreenComponent,
    Profiler,
    ScopeComponent,
    SimpleMemoComponent,
    SuspenseComponent,
    SuspenseListComponent,
    TracingMarkerComponent,
    Throw,
    ViewTransitionComponent,
    ActivityComponent,
  } = ReactTypeOfWork;

  // TODO: any return type might be wrong
  function resolveFiberType(type: any): any {
    const typeSymbol = getTypeSymbol(type);
    switch (typeSymbol) {
      case MEMO_NUMBER:
      case MEMO_SYMBOL_STRING:
        // recursively resolving memo type in case of memo(forwardRef(Component))
        return resolveFiberType(type.type);
      case FORWARD_REF_NUMBER:
      case FORWARD_REF_SYMBOL_STRING:
        return type.render;
      default:
        return type;
    }
  }

  // NOTICE Keep in sync with shouldFilterFiber() and other get*ForFiber methods
  function getDisplayNameForFiber(
    fiber: Fiber,
    shouldSkipForgetCheck: boolean = false,
  ): string | null {
    const {elementType, type, tag} = fiber;

    let resolvedType = type;
    if (typeof type === 'object' && type !== null) {
      resolvedType = resolveFiberType(type);
    }

    let resolvedContext: any = null;
    if (
      !shouldSkipForgetCheck &&
      // $FlowFixMe[incompatible-type] fiber.updateQueue is mixed
      (fiber.updateQueue?.memoCache != null ||
        (Array.isArray(fiber.memoizedState?.memoizedState) &&
          fiber.memoizedState.memoizedState[0]?.[REACT_MEMO_CACHE_SENTINEL]) ||
        fiber.memoizedState?.memoizedState?.[REACT_MEMO_CACHE_SENTINEL])
    ) {
      const displayNameWithoutForgetWrapper = getDisplayNameForFiber(
        fiber,
        true,
      );
      if (displayNameWithoutForgetWrapper == null) {
        return null;
      }

      return `Forget(${displayNameWithoutForgetWrapper})`;
    }

    switch (tag) {
      case ActivityComponent:
        return 'Activity';
      case CacheComponent:
        return 'Cache';
      case ClassComponent:
      case IncompleteClassComponent:
      case IncompleteFunctionComponent:
      case FunctionComponent:
      case IndeterminateComponent:
        return getDisplayName(resolvedType);
      case ForwardRef:
        return getWrappedDisplayName(
          elementType,
          resolvedType,
          'ForwardRef',
          'Anonymous',
        );
      case HostRoot:
        const fiberRoot = fiber.stateNode;
        if (fiberRoot != null && fiberRoot._debugRootType !== null) {
          return fiberRoot._debugRootType;
        }
        return null;
      case HostComponent:
      case HostSingleton:
      case HostHoistable:
        return type;
      case HostPortal:
      case HostText:
        return null;
      case Fragment:
        return 'Fragment';
      case LazyComponent:
        // This display name will not be user visible.
        // Once a Lazy component loads its inner component, React replaces the tag and type.
        // This display name will only show up in console logs when DevTools DEBUG mode is on.
        return 'Lazy';
      case MemoComponent:
      case SimpleMemoComponent:
        // Display name in React does not use `Memo` as a wrapper but fallback name.
        return getWrappedDisplayName(
          elementType,
          resolvedType,
          'Memo',
          'Anonymous',
        );
      case LegacyHiddenComponent:
        return 'LegacyHidden';
      case OffscreenComponent:
        return 'Offscreen';
      case ScopeComponent:
        return 'Scope';
      case SuspenseComponent:
        return 'Suspense';
      case SuspenseListComponent:
        return 'SuspenseList';
      case TracingMarkerComponent:
        return 'TracingMarker';
      case ViewTransitionComponent:
        return 'ViewTransition';
      case Throw:
        return 'Throw';
      default:
        const typeSymbol = getTypeSymbol(type);

        switch (typeSymbol) {
          case CONCURRENT_MODE_NUMBER:
          case CONCURRENT_MODE_SYMBOL_STRING:
          case DEPRECATED_ASYNC_MODE_SYMBOL_STRING:
            return 'ConcurrentMode';
          case PROVIDER_NUMBER:
          case PROVIDER_SYMBOL_STRING:
            // Grab the displayName from the type if it's available.
            // If it doesn't have a displayName, we'll fall back to the generic "Context.Provider" name.
            if (resolvedContext == null) {
              resolvedContext = type._context || type;
            }
            return `${resolvedContext.displayName || 'Context'}.Provider`;
          case CONTEXT_NUMBER:
          case CONTEXT_SYMBOL_STRING:
          case SERVER_CONTEXT_SYMBOL_STRING:
            // Grab the displayName from the type if it's available.
            // If it doesn't have a displayName, we'll fall back to the generic "Context.Consumer" name.
            if (resolvedContext == null) {
              resolvedContext = type._context || type;
            }
            return `${resolvedContext.displayName || 'Context'}.Consumer`;
          case CONSUMER_SYMBOL_STRING:
            // Grab the displayName from the type if it's available.
            // If it doesn't have a displayName, we'll fall back to the generic "Context.Consumer" name.
            if (resolvedContext == null) {
              resolvedContext = type;
            }
            return `${resolvedContext.displayName || 'Context'}.Consumer`;
          case STRICT_MODE_NUMBER:
          case STRICT_MODE_SYMBOL_STRING:
            return 'StrictMode';
          case PROFILER_NUMBER:
          case PROFILER_SYMBOL_STRING:
            return `Profiler`;
          case SCOPE_NUMBER:
          case SCOPE_SYMBOL_STRING:
            return 'Scope';
          default:
            // Unknown element type.
            // This may mean a new element type that has not yet been added to DevTools.
            return null;
        }
    }
  }

  return {
    getDisplayNameForFiber,
    getTypeSymbol,
    ReactPriorityLevels,
    ReactTypeOfWork,
    StrictModeBits,
  };
}
