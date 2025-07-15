/*
 * Tencent is pleased to support the open source community by making
 * 蓝鲸智云PaaS平台 (BlueKing PaaS) available.
 *
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.  All rights reserved.
 *
 * 蓝鲸智云PaaS平台 (BlueKing PaaS) is licensed under the MIT License.
 *
 * License for 蓝鲸智云PaaS平台 (BlueKing PaaS):
 *
 * ---------------------------------------------------
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
import { defineComponent, type PropType, watch, shallowRef, reactive } from 'vue';
import { computed } from 'vue';

import { Select, Input, Tab } from 'bkui-vue';
import { transformDataKey } from 'monitor-common/utils/utils';

import HttpAuth from './components/http-auth';
import HttpBody from './components/http-body';
import HttpConfig from './components/http-config';
import HttpHeader from './components/http-header';
import HttpParams from './components/http-params';

import type { IActionParams, IActionConfig } from '../typing';

import './plugin-web-hook.scss';

const httpPartComMap = {
  Params: HttpParams,
  Authorization: HttpAuth,
  Headers: HttpHeader,
  Body: HttpBody,
  Seting: HttpConfig,
};

const methodList = ['POST', 'GET'];

const httpRequrestTabList = [
  {
    key: 'Params',
    name: `${window.i18n.t('参数')}`,
    desc: '',
    value: [],
  },
  {
    key: 'Authorization',
    name: `${window.i18n.t('认证')}`,
    desc: '',
    type: 'none',
    bearer_token: { token: '' },
    basic_auth: { username: '', password: '' },
  },
  {
    key: 'Headers',
    name: `${window.i18n.t('头信息')}`,
    desc: '',
    hide: true,
    value: [],
  },
  {
    key: 'Body',
    name: `${window.i18n.t('主体')}`,
    desc: '',
    type: 'default',
    form_data: [],
    x_www_form_urlencoded: [],
    raw: { type: 'text', content: '' },
  },
  {
    key: 'Seting',
    name: `${window.i18n.t('设置')}`,
    desc: '',
    value: {
      timeout: 10,
      retryInterval: 2,
      maxRetryTimes: 2,
      needPoll: false,
      notifyInterval: 120,
    },
  },
];

const headerHideTips = {
  true: {
    placement: 'top',
    content: `${window.i18n.t('点击展开全部')}`,
  },
  false: {
    placement: 'top',
    content: `${window.i18n.t('点击隐藏默认')}`,
  },
};

const genDefaultData = () => ({
  authorize: {
    authConfig: {},
    authType: 'none',
  },
  body: {
    content: '',
    contentType: 'default',
    dataType: 'default',
    params: [],
  },
  failedRetry: {
    isEnable: false,
    maxRetryTimes: 2,
    needPoll: false,
    notifyInterval: 120,
    retryInterval: 2,
    timeout: 10,
  },
  method: 'GET',
  headers: [
    {
      isEnabled: true,
      key: '',
      value: '',
      desc: '',
    },
  ],
  queryParams: [
    {
      isEnabled: true,
      key: '',
      value: '',
      desc: '',
    },
  ],
  url: '',
  timeout: 0,
});

export default defineComponent({
  props: {
    actionParams: {
      type: Object as PropType<IActionParams>,
      required: true,
    },
    actionConfig: {
      type: Object as PropType<IActionConfig>,
      required: true,
    },
  },
  setup(props) {
    const webHookData = reactive(genDefaultData());
    const currentHttpConfig = shallowRef(httpRequrestTabList[0].key);

    const requestCom = computed(() => httpPartComMap[currentHttpConfig.value]);

    watch(
      () => props.actionParams,
      () => {
        if (!props.actionParams) {
          return;
        }
        const { templateDetail } = transformDataKey(props.actionParams.execute_config);
        console.log('watch actionParams', templateDetail);
        if (templateDetail.headers && templateDetail.headers.length > 0) {
          webHookData.headers = templateDetail.headers;
        }
        if (templateDetail.queryParams && templateDetail.queryParams.length > 0) {
          webHookData.queryParams = templateDetail.queryParams;
        }
        webHookData.authorize = templateDetail.authorize;
        webHookData.body = templateDetail.body;
        webHookData.failedRetry = {
          isEnable: Boolean(templateDetail.failedRetry.isEnable),
          maxRetryTimes: templateDetail.failedRetry.maxRetryTimes,
          needPoll: templateDetail.needPoll,
          notifyInterval: templateDetail.notifyInterval / 60,
          retryInterval: templateDetail.failedRetry.retryInterval,
          timeout: templateDetail.failedRetry.timeout,
        };
        webHookData.url = templateDetail.url;
        webHookData.method = templateDetail.method;
        webHookData.timeout = props.actionParams.execute_config.timeout / 60;
      },
      {
        immediate: true,
      }
    );

    return () => {
      return (
        <div class='alarm-center-manual-process-plugin-web-hook'>
          <div class='web-hook-base-box'>
            <Select
              v-model={webHookData.method}
              behavior='simplicity'
            >
              {methodList.map(method => (
                <Select.Option
                  id={method}
                  key={method}
                  name={method}
                >
                  {method}
                </Select.Option>
              ))}
            </Select>
            <Input
              class='ml-18'
              behavior='simplicity'
              modelValue={webHookData.url}
            />
          </div>
          <div class='http-config-wrapper'>
            <Tab
              class='mb-12'
              v-model:active={currentHttpConfig.value}
              labelHeight={36}
              type='unborder-card'
            >
              {httpRequrestTabList.map(item => (
                <Tab.TabPanel
                  key={item.key}
                  label={item.name}
                  name={item.key}
                />
              ))}
            </Tab>
            <requestCom.value modelValue={webHookData} />
          </div>
        </div>
      );
    };
  },
});
