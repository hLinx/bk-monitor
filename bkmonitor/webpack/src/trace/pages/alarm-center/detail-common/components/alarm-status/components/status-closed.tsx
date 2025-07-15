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
import { defineComponent, shallowRef, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import { listAlertLog } from 'monitor-api/modules/alert';

import './status-closed.scss';

export default defineComponent({
  name: 'StatusClosed',
  props: {
    data: Object as PropType<{
      bk_biz_id: number;
      id: number;
    }>,
  },
  setup(props, context) {
    console.log(props.data);

    const { t } = useI18n();

    const logTips = shallowRef('');

    const fetchAlterLog = async () => {
      const result = await listAlertLog({
        bk_biz_id: props.data.bk_biz_id,
        id: props.data.id,
        offset: 0,
        limit: 1,
        operate: ['CLOSE'],
      });

      logTips.value = result[0]?.contents?.[0] ? result[0].contents[0] : t('告警已失效');
    };

    fetchAlterLog();

    return () => (
      <div class='alarm-center-detail-alarm-status-closed'>
        <i
          style='color: #979BA5'
          class='icon-monitor icon-mc-close-fill mr-4'
        />
        <div>{t('已失效')}</div>
        {context.slots.default?.()}
        {logTips.value && (
          <>
            <div class='line' />
            <div style='color: #979ba5'>{logTips.value}</div>
          </>
        )}
      </div>
    );
  },
});
