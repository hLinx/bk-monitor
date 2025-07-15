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
import { useI18n } from 'vue-i18n';

import { Radio } from 'bkui-vue';

const authRadioList = [
  { id: 'none', name: `${window.i18n.t('无需认证')}` },
  { id: 'bearer_token', name: 'Bearer Token' },
  { id: 'basic_auth', name: 'Basic Auth' },
];

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<{
        authorize: {
          authConfig: Record<string, string>;
          authType: string;
        };
      }>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();
    return () => (
      <div>
        <Radio.Group modelValue={props.modelValue.authorize.authType}>
          {authRadioList.map(item => (
            <Radio
              key={item.id}
              label={item.id}
            >
              {item.name}
            </Radio>
          ))}
        </Radio.Group>
        {props.modelValue.authorize.authType === 'node' && (
          <div style='color: #979ba5;font-size: 12px; line-height: 16px;margin-top: 7px;'>
            {t('该请求不需要任何认证。')}
          </div>
        )}
      </div>
    );
  },
});
