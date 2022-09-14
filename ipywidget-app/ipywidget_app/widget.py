from time import sleep
from typing import Any, Dict, List
from ipywidgets import Box
from traitlets import Dict as TDict
from traitlets import Int, Unicode
import logging


class BaseWidget(Box):

    _model_name = Unicode('WidgetAppModel').tag(sync=True)
    _model_module = Unicode('ipywidget-app').tag(sync=True)
    _model_module_version = Unicode('0.1.0').tag(sync=True)

    _view_name = Unicode('WidgetAppView').tag(sync=True)
    _view_module = Unicode('ipywidget-app').tag(sync=True)
    _view_module_version = Unicode('0.1.0').tag(sync=True)
    title = Unicode('BaseWidget').tag(sync=True)
    params = TDict(default_value={}, allow_none=False).tag(sync=True)
    result = TDict(default_value={'key': 'None'}, allow_none=False).tag(
        sync=True
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        print('widget called')
        self.on_msg(self._handle_button_msg)

    def _handle_button_msg(
        self, model: Any, content: Dict, buffers: List
    ) -> None:
        print('Received task from frontend', content)
        payload = content['payload']
        sleep(5)
        print('Done')
        self.send(
            {
                'action': content['action'],
                'taskId': content['taskId'],
                'payload': payload[0] / payload[1],
            }
        )
