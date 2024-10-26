"use strict";
import {
  Disposable,
  ExtensionContext,
  StatusBarAlignment,
  StatusBarItem,
  window,
  workspace,
} from "vscode";
import RollingArray from "./rollingqueue";

export function activate(context: ExtensionContext) {
  let typingSpeed = new TypingSpeed();
  let controller = new TypingSpeedController(typingSpeed);

  context.subscriptions.push(controller);
  context.subscriptions.push(typingSpeed);
}

class TypingSpeed {
  private _keystrokes: RollingArray = new RollingArray(100);
  private _statusBarItem: StatusBarItem;
  private _lastUpdate: number = 0;

  public updateSpeed() {
    if (!this._statusBarItem) {
      this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    }

    const now = Date.now();
    if (now - this._lastUpdate > 2000) {
      this._keystrokes.clear();
    }
    this._lastUpdate = now;
    this._keystrokes.add(now);
    // Read the configuration option
    const config = workspace.getConfiguration("typingSpeed");
    const displayType = config.get<string>("display", "wpm");

    let cpm = 0;
    let wpm = 0;
    const count = this._keystrokes.size();
    if (count > 1) {
      const firstTime = this._keystrokes.first();
      cpm = (count * 60000) / (now - firstTime);
      wpm = cpm / 5;
    }

    this._statusBarItem.text = `$(keyboard) ${
      displayType === "cpm" ? `${cpm.toFixed(1)} cpm` : `${wpm.toFixed(1)} wpm`
    }`;
    this._statusBarItem.show();
  }

  dispose() {
    this._statusBarItem.dispose();
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}

class TypingSpeedController {
  private _typingSpeed: TypingSpeed;
  private _disposable: Disposable;

  constructor(typingSpeed: TypingSpeed) {
    this._typingSpeed = typingSpeed;

    let subscriptions: Disposable[] = [];
    window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);

    this._typingSpeed.updateSpeed();

    this._disposable = Disposable.from(...subscriptions);
  }

  dispose() {
    this._disposable.dispose();
  }

  private _onEvent() {
    this._typingSpeed.updateSpeed();
  }
}
