import { uuid } from '@jupyter-widgets/base';
import { IIOPubMessage } from '@jupyterlab/services/lib/kernel/messages';
import * as React from 'react';
import { WidgetAppModel } from './model';

interface IProps {
  send_msg: (arg: any) => void;
  model: WidgetAppModel;
}

interface IState {
  inputOne: number;
  inputTwo: number;
  result: number;
  tasks: string[];
  log: string[];
}

export class Component extends React.Component<IProps, IState> {
  private _model: WidgetAppModel;
  private _send_msg: (arg: any) => void;
  constructor(props: IProps) {
    super(props);
    this._model = props.model;
    this._send_msg = props.send_msg;
    this.state = {
      inputOne: 0,
      inputTwo: 0,
      result: 0,
      tasks: [],
      log: []
    };
    this._model.listenTo(
      this._model,
      'msg:custom',
      (data: any, buffer: any[]) => {
        console.log('ret', data);
        const tasks = this.state.tasks.filter(id => id !== data['taskId']);

        this.setState(old => ({ ...old, result: data['payload'], tasks }));
      }
    );
    WidgetAppModel.KERNEL.iopubMessage.connect((_, msg) => {
      this.setState(old => ({ ...old, log: [...old.log, this.msgToLog(msg)] }));
    });
  }

  msgToLog(msg: IIOPubMessage): string {
    const { header, content } = msg;
    return `[${header.msg_type}]: ${JSON.stringify(content)}`;
  }

  render(): React.ReactNode {
    return (
      <div>
        <div
          style={{ display: 'flex', flexDirection: 'column', padding: '50px' }}
        >
          <input
            placeholder="Input one"
            type="number"
            value={this.state.inputOne}
            onChange={e =>
              this.setState(old => ({
                ...old,
                inputOne: parseFloat(e.target.value)
              }))
            }
            style={{ margin: '5px' }}
          />
          <input
            style={{ margin: '5px' }}
            placeholder="Input two"
            type="number"
            value={this.state.inputTwo}
            onChange={e =>
              this.setState(old => ({
                ...old,
                inputTwo: parseFloat(e.target.value)
              }))
            }
          />
          <input
            readOnly={true}
            style={{ margin: '5px' }}
            placeholder="Result"
            type="number"
            value={this.state.result}
          />
        </div>
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => {
              console.log('send');
              const taskId = uuid();
              this.setState(
                old => ({ ...old, tasks: [...old.tasks, taskId] }),
                () => {
                  console.log('task', this.state.tasks);

                  this._send_msg({
                    action: 'Add',
                    payload: [this.state.inputOne, this.state.inputTwo],
                    taskId
                  });
                }
              );
            }}
          >
            Submit
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            flexFlow: 'row',
            justifyContent: 'space-around'
          }}
        >
          <div style={{ display: 'flex', flexFlow: 'column', width: '20%' }}>
            <label htmlFor="job-id-area">Job IDs</label>
            <textarea
              id="job-id-area"
              readOnly={true}
              cols={30}
              rows={30}
              value={JSON.stringify(this.state.tasks)}
            />
          </div>
          <div style={{ display: 'flex', flexFlow: 'column', width: '60%' }}>
            <label htmlFor="log-area">Log</label>
            <textarea
              id="log-area"
              readOnly={true}
              cols={0}
              rows={30}
              value={this.state.log.join('\n')}
            />
          </div>
        </div>
      </div>
    );
  }
}
