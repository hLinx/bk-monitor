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

import { defineComponent, type PropType } from 'vue';

import { Form, Input } from 'bkui-vue';

const itemList = [
  {
    id: 'timeout',
    name: `${window.i18n.t('请求超时')}`,
    unit: 's',
  },
  {
    id: 'retryInterval',
    name: `${window.i18n.t('重试间隔')}`,
    unit: 's',
  },
  {
    id: 'maxRetryTimes',
    name: `${window.i18n.t('重试次数')}`,
    unit: `${window.i18n.t('次')}`,
  },
  {
    id: 'needPoll',
    name: `${window.i18n.t('是否周期回调')}`,
    unit: '',
  },
  {
    id: 'notifyInterval',
    name: `${window.i18n.t('回调间隔')}`,
    unit: `${window.i18n.t('分钟')}`,
  },
];

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<{
        failedRetry: {
          isEnable: boolean;
          maxRetryTimes: number;
          needPoll: boolean;
          notifyInterval: number;
          retryInterval: number;
          timeout: number;
        };
      }>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <div class='web-hook-seting-config'>
        <Form formType='vertical'>
          {itemList.map(item => (
            <Form.FormItem
              key={item.id}
              label={item.name}
            >
              <Input
                v-model={props.modelValue.failedRetry[item.id]}
                behavior='simplicity'
              />
              <span class='web-hook-seting-unit'>{item.unit}</span>
            </Form.FormItem>
          ))}
        </Form>
      </div>
    );
  },
});
