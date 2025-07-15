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

import { defineComponent, type PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import _ from 'lodash';

import type { IAlert } from '../../../typeing';

import './render-dimension.scss';

const cloudIdMap = {
  bk_target_cloud_id: true,
  bk_cloud_id: true,
};

const ipMap = {
  bk_target_ip: true,
  ip: true,
  bk_host_id: true,
  'tags.bcs_cluster_id': true,
};

export default defineComponent({
  props: {
    data: Object as PropType<IAlert>,
  },

  setup(props) {
    const { t } = useI18n();

    const renderDimensionList = computed(() => {
      return _.filter(props.data.dimensions, item => !cloudIdMap[item.key] || item.value !== 0);
    });

    return () => (
      <div class='alarm-center-detail-alarm-info-dimension'>
        <div class='block-title'>{t('维度信息')}</div>
        <div class='dimension-list'>
          {renderDimensionList.value.map(item => (
            <div
              key={item.display_key}
              style={{
                cursor: ipMap[item.key] ? 'pointer' : 'auto',
              }}
              class='dimension-item'
            >
              <div>
                <span class='name'>{item.display_key}</span>
                <span class='eq'>=</span>
              </div>
              <div
                class={{
                  'dimension-value': true,
                  'info-check': ipMap[item.key],
                }}
              >
                {item.display_value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
});
