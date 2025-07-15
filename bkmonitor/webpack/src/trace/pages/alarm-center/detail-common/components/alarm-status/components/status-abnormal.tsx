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

import { Button } from 'bkui-vue';
import { checkAllowedByActionIds, getAuthorityDetail, getAuthorityMeta } from 'monitor-api/modules/iam';

import './status-abnormal.scss';

export default defineComponent({
  name: 'StatusAbnormal',
  props: {
    data: Object as PropType<{
      is_ack: boolean;
      is_shielded: boolean;
      shield_id: number;
      shield_left_time: string;
    }>,
  },
  setup(props, context) {
    const { t } = useI18n();

    const handleQuickShield = () => {};

    const renderDescription = () => {
      if (props.data.is_ack && props.data.is_shielded) {
        return null;
      }
      if (props.data.is_shielded) {
        return `(${t('已屏蔽')})`;
      }
      if (props.data.is_ack) {
        return `(${t('已确认')})`;
      }
    };

    const renderOperation = () => {
      if (!props.data.is_ack && !props.data.is_shielded) {
        return (
          <>
            <Button
              class='mr-10'
              theme='primary'
              text
            >
              <i class='icon-monitor icon-mc-notice-shield' />
              {t('快捷屏蔽')}
            </Button>
            <Button
              size='small'
              theme='primary'
            >
              {t('告警确认')}
            </Button>
          </>
        );
      }
      if (props.data.is_shielded) {
        return (
          <Button
            size='small'
            theme='primary'
          >
            {t('屏蔽策略')}
          </Button>
        );
      }
      if (props.data.is_ack) {
        return (
          <Button
            size='small'
            theme='primary'
          >
            {t('快捷屏蔽')}
          </Button>
        );
      }
      return null;
    };

    return () => (
      <div class='alarm-center-detail-alarm-status-abnormal'>
        <i
          style='color: #ff5656'
          class='icon-monitor icon-mc-check-fill mr-4'
        />
        <div>
          {t('未恢复')}
          <span>{renderDescription()}</span>
        </div>
        {context.slots.default?.()}
        {props.data.is_shielded && props.data.shield_id && (
          <div>
            <span class='line' />
            <span class='shielded-text'>{t('屏蔽时间剩余')}：</span>
            <span class='shielded-time'>{props.data.shield_left_time}</span>
          </div>
        )}
        <div class='operation-box'>{renderOperation()}</div>
      </div>
    );
  },
});
