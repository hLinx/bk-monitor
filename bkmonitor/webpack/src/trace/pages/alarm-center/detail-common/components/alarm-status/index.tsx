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

import StatusAbnormal from './components/status-abnormal';
import StatusClosed from './components/status-closed';
import StatusRecovered from './components/status-recovered';

import type { IAlert } from '../../typeing';

import './index.scss';

const statusComMap = {
  RECOVERED: StatusRecovered,
  ABNORMAL: StatusAbnormal,
  CLOSED: StatusClosed,
};

export default defineComponent({
  props: {
    data: Object as PropType<IAlert>,
  },
  setup(props) {
    console.log(props.data);

    const { t } = useI18n();

    const renderDuration = () => {
      if (props.data.status !== 'CLOSED' && props.data.duration && !props.data.is_shielded) {
        return (
          <div class='status-duration-box'>
            <span class='line' />
            <span>{t('持续时间')}：</span>
            <span>{props.data.duration}</span>
          </div>
        );
      }
    };

    return () => {
      const statusCom = statusComMap[props.data.status];
      console.log(statusCom);
      return (
        <div class='alarm-center-detail-alarm-status'>
          <statusCom data={props.data}>{renderDuration()}</statusCom>
        </div>
      );
    };
  },
});
