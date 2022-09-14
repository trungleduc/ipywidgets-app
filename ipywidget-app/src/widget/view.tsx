import { VBoxView } from '@jupyter-widgets/controls';
import ReactDOM from 'react-dom';
import * as React from 'react';
import { Component } from './component';
import { WidgetAppModel } from './model';

export class WidgetAppView extends VBoxView {
  render(): void {
    const send_msg = this.send.bind(this);
    const comp = (
      <Component send_msg={send_msg} model={this.model as WidgetAppModel} />
    );
    ReactDOM.render(comp, document.getElementById('main'));
  }
}
