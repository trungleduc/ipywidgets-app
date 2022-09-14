import * as base from '@jupyter-widgets/base';
import { HTMLManager } from '@jupyter-widgets/html-manager';
import { Kernel } from '@jupyterlab/services';
import { WidgetAppModel } from './widget/model';
import { WidgetAppView } from './widget/view';

export class WidgetManager extends HTMLManager {
  constructor(private _kernel: Kernel.IKernelConnection) {
    super();

    _kernel.registerCommTarget(this.comm_target_name, async (comm, msg) => {
      const oldComm = new base.shims.services.Comm(comm);
      await this.handle_comm_open(oldComm, msg);
    });
  }

  loadClass(
    className: string,
    moduleName: string,
    moduleVersion: string
  ): Promise<any> {
    if (className === 'WidgetAppModel') {
      return Promise.resolve(WidgetAppModel);
    } else if (className === 'WidgetAppView') {
      return Promise.resolve(WidgetAppView);
    } else if (
      moduleName === '@jupyter-widgets/base' ||
      moduleName === '@jupyter-widgets/controls'
    ) {
      return super.loadClass(className, moduleName, moduleVersion);
    } else {
      return Promise.reject(`Can not import ${moduleName}@${moduleVersion}`);
    }
  }

//   async display_view(
//     view: Promise<DOMWidgetView> | DOMWidgetView,
//     el: HTMLElement
//   ): Promise<void> {

//   }

  async _create_comm(
    target_name: string,
    model_id: string,
    data?: any,
    metadata?: any
  ): Promise<any> {
    const comm = this._kernel.createComm(target_name, model_id);
    if (data || metadata) {
      comm.open(data, metadata);
    }
    return Promise.resolve(new base.shims.services.Comm(comm));
  }

  /**
   * Get the currently-registered comms.
   */
  _get_comm_info(): Promise<any> {
    return this._kernel
      .requestCommInfo({ target_name: this.comm_target_name })
      .then(reply => (reply.content as any).comms);
  }
}
