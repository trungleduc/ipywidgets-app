import { BoxModel } from '@jupyter-widgets/controls';
import { Kernel } from '@jupyterlab/services';
// import { UUID } from '@lumino/coreutils';

export class WidgetAppModel extends BoxModel {
  model_name: string;
  view_name: string;
  defaults() {
    return {
      ...super.defaults(),
      _model_name: this.model_name,
      _model_module: WidgetAppModel.model_module,
      _model_module_version: WidgetAppModel.model_module_version,
      _view_name: this.view_name,
      _view_module: WidgetAppModel.view_module,
      _view_module_version: WidgetAppModel.view_module_version,
      result: {},
      params: {}
    };
  }

  //   initialize(
  //     attributes: any,
  //     options: {
  //       model_id: string;
  //       comm?: any;
  //       widget_manager: any;
  //     }
  //   ) {
  //     super.initialize(attributes, options);
  //     // this.widget_manager.create_view(this);
  //   }

  static model_name = 'WidgetAppModel';
  static model_module = 'ipywidget-app';
  static model_module_version = '0.1.0';
  static view_name = 'WidgetAppView';
  static view_module = 'ipywidget-app';
  static view_module_version = '0.1.0';
  static KERNEL: Kernel.IKernelConnection;
}
