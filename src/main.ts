import {
  platformNativeScript,
  runNativeScriptAngularApp,
} from "@nativescript/angular";
import { GPU } from "@nativescript/canvas";
globalThis.navigator ??= {
  // @ts-expect-error
  gpu: new GPU(),
};

declare const jp: any;

if (global.isAndroid) {
  jp.wasabeef.takt.Takt.stock(Utils.android.getApplicationContext()).seat(jp.wasabeef.takt.Seat.TOP_CENTER).color(-65536);
}

import { AppModule } from "./app/app.module";
import {
  CoreTypes,
  SharedTransition,
  TouchManager,
  Utils,
  View,
  ViewBase,
  querySelectorAll,
} from "@nativescript/core";

// Note:
// - You can customize how shared elements are found by overriding SharedTransition.getSharedElements
// - With our app we know we only want one found shared element
// between pages so we use presentingSharedElements.find vs the default .filter
SharedTransition.getSharedElements = function (
  fromPage: ViewBase,
  toPage: ViewBase
): { sharedElements: View[]; presented: View[]; presenting: View[] } {
  const presentedSharedElements = querySelectorAll(
    toPage,
    "sharedTransitionTag"
  ).filter(
    (v) =>
      !v.sharedTransitionIgnore && typeof v.sharedTransitionTag === "string"
  );
  const presentingSharedElements = querySelectorAll(
    fromPage,
    "sharedTransitionTag"
  ).filter(
    (v) =>
      !v.sharedTransitionIgnore && typeof v.sharedTransitionTag === "string"
  );
  const presentedTags = presentedSharedElements.map(
    (v) => v.sharedTransitionTag
  );
  return {
    sharedElements: [
      presentingSharedElements.find((v) =>
        presentedTags.includes(v.sharedTransitionTag)
      ),
    ] as Array<View>,
    presented: presentedSharedElements as Array<View>,
    presenting: presentingSharedElements as Array<View>,
  };
};

runNativeScriptAngularApp({
  appModuleBootstrap: () => platformNativeScript().bootstrapModule(AppModule),
});
