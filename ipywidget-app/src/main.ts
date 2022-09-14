import { WidgetAppModel } from './widget/model';
import { Kernel, ServerConnection, KernelManager, KernelMessage } from '@jupyterlab/services';
import { WidgetManager } from './manager';
export * as base from '@jupyter-widgets/base'
export * as controls from '@jupyter-widgets/controls'

export class Main {
  private _baseUrl: string;
  private _wsUrl: string;
  private _kernel: Kernel.IKernelConnection;
  private _kernelManager: KernelManager;
  private _kernelModel?: Kernel.IModel;
  private _widgetManager: WidgetManager
  constructor(baseUrl: string, wsUrl: string) {
    this._baseUrl = baseUrl;
    this._wsUrl = wsUrl;
    const appKernelName = window.sessionStorage.getItem('app_kernel_name');
    const appKernelId = window.sessionStorage.getItem('app_kernel_id');
    if (appKernelName && appKernelId) {
      this._kernelModel = {
        name: appKernelName,
        id: appKernelId
      };
    }
  }
  async checkKernel(id: string): Promise<boolean> {
    const url = `${this._baseUrl}api/kernels/${id}`;

    const setting = ServerConnection.makeSettings();
    const init = {};

    let response: Response;
    try {
      response = await ServerConnection.makeRequest(url, init, setting);
    } catch (error) {
      return false;
    }

    const data = await response.json();

    if (
      'message' in data &&
      (data['message'] as string).includes('Kernel does not exist')
    ) {
      return false;
    } else {
      return true;
    }
  }

  async connectKernel(): Promise<void> {
    const connectionInfo = ServerConnection.makeSettings({
      baseUrl: this._baseUrl,
      wsUrl: this._wsUrl
    });

    this._kernelManager = new KernelManager({
      serverSettings: connectionInfo
    });
    let kernelStatus = false;
    if (this._kernelModel) {
      console.log('Checking existing kernel', this._kernelModel.id);
      kernelStatus = await this.checkKernel(this._kernelModel.id);
    }
    if (kernelStatus) {
      this._kernel = await this._kernelManager.connectTo({
        model: this._kernelModel!
      });
      console.log('kernel reused', this._kernel.model);
    } else {
      this._kernel = await this._kernelManager.startNew({});
      window.sessionStorage.setItem('app_kernel_name', this._kernel.model.name);
      window.sessionStorage.setItem('app_kernel_id', this._kernel.model.id);
      console.log('kernel started', this._kernel.model);
    }
    WidgetAppModel.KERNEL = this._kernel
  }

  async shutdownKernel(): Promise<void> {
    this._kernel.shutdown();
  }

  async startWidget(): Promise<void> {
    this._widgetManager = new WidgetManager(this._kernel);
    const code = 
`
from ipywidget_app.widget import BaseWidget
BaseWidget()
`;
  const execution = this._kernel.requestExecute({ code });
  execution.onIOPub = async (msg) => {
    console.log('msg', msg);
    if (
      KernelMessage.isStreamMsg(msg) ||
      KernelMessage.isExecuteInputMsg(msg)
    ) {
      /** no-op */
    }
    if (KernelMessage.isExecuteResultMsg(msg)) {      
      const widgetData: any =
        msg.content.data['application/vnd.jupyter.widget-view+json'];
      if (widgetData !== undefined && widgetData.version_major === 2) {
        const model = this._widgetManager.get_model(widgetData.model_id);
        if (model !== undefined) {
          model.then(async (model) => {
            await this._widgetManager.create_view(model);            
          });
        }
      }
    } else if (KernelMessage.isErrorMsg(msg)) {
      console.log('error', msg);
      
    }
  };
}

}
