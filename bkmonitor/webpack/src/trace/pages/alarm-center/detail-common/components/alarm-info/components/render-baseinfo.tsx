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
import { shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { Tag, Button } from 'bkui-vue';
import dayjs from 'dayjs';
import _ from 'lodash';
import { searchAction } from 'monitor-api/modules/alert';

import { useAppStore } from '../../../../../../store/modules/app';
import AlarmDispath from './components/alarm-dispatch';
import ManualProcess from './components/manual-process/index';
import ProcessStatusDetail from './components/process-status-detail';

import type { IAlert } from '../../../typeing';

import './render-baseinfo.scss';

export enum ETagsType {
  BCS = 'bcs' /** 容器项目 */,
  BKCC = 'bkcc' /** 业务 */,
  BKCI = 'bkci' /** 蓝盾项目 */,
  BKSAAS = 'bksaas' /** 蓝鲸应用 */,
  MONITOR = 'monitor' /** 监控空间 */,
}

export default defineComponent({
  props: {
    data: Object as PropType<IAlert>,
  },

  setup(props) {
    const { t } = useI18n();
    const store = useAppStore();

    const actionInfo = shallowRef<{
      actions: any[];
      overview: {
        children: {
          id: string;
          name: string;
          count: number;
        }[];
        count: number;
        id: string;
        name: string;
      };
      total: number;
    }>();
    const isShowStatusDetail = shallowRef(false);
    const isShowManualProcess = shallowRef(false);
    const isShowAlarmDispath = shallowRef(false);

    const renderSpaceText = computed(() => {
      const currentBiz = _.find(store.bizList, item => item.id === props.data.bk_biz_id);

      const bizIdName =
        currentBiz?.space_type_id === ETagsType.BKCC
          ? `#${currentBiz?.id}`
          : currentBiz?.space_id || currentBiz?.space_code || '';

      return currentBiz ? `${currentBiz?.text} (${bizIdName})` : '--';
    });

    const renderStatusText = computed(() => {
      // 从 props.data 中获取总计数，如果不存在则返回 '--'
      if (!actionInfo.value) {
        return '--';
      }
      const total = actionInfo.value.overview.count;
      if (!total) return '--';

      // 定义需要统计的状态及其初始计数
      const statusKeys = ['success', 'failure', 'partial_failure'];
      const statusCounts = Object.fromEntries(statusKeys.map(key => [key, 0]));

      // 遍历 children 数组，更新对应状态的计数
      const children = actionInfo.value.overview.children || [];
      children.map(item => {
        if (statusKeys.includes(item.id)) {
          statusCounts[item.id] = item.count;
        }
      });

      // 生成每种状态的描述字符串数组
      const statusDescriptions = statusKeys
        .map(key => {
          const count = statusCounts[key];
          if (count) {
            const statusText = {
              success: '次成功',
              failure: '次失败',
              partial_failure: '次部分失败',
            }[key];
            return t(`{0}${statusText}`, [count]);
          }
          return null;
        })
        .filter(description => description !== null);
      // 拼接所有状态描述字符串
      const details = statusDescriptions.join(', ');

      // 生成最终的状态字符串
      return `${t(' {0} 次', [total])}(${details})`;
    });

    const bkCollectConfigId = computed(() => {
      const labels = props.data.extra_info?.strategy?.labels || [];
      const need = labels.some(item => ['集成内置', 'Datalink BuiltIn'].includes(item));
      return need
        ? props.data.dimensions?.find(
            item => item.key === 'bk_collect_config_id' || item.key === 'tags.bk_collect_config_id'
          )?.value
        : '';
    });

    const fetchActionInfo = async () => {
      actionInfo.value = await searchAction({
        bk_biz_id: props.data.bk_biz_id,
        page: 1,
        page_size: 100,
        alert_ids: [props.data.id],
        status: ['failure', 'success', 'partial_failure'],
        ordering: ['-create_time'],
        conditions: [
          {
            key: 'parent_action_id',
            value: [0],
            method: 'eq',
          },
        ], // 处理状态数据写死条件
      });
    };

    fetchActionInfo();

    const handleShowProcessStatusDetail = () => {
      isShowStatusDetail.value = true;
    };

    const handleShowManualProcess = () => {
      isShowManualProcess.value = true;
    };

    const handleShowAlarmDispath = () => {
      isShowAlarmDispath.value = true;
    };

    const handleToCollectDetail = () => {
      window.open(
        `${location.origin}${location.pathname}?bizId=${props.data.bk_biz_id}#/collect-config/detail/${bkCollectConfigId.value}?tab=targetDetail`
      );
    };

    return () => (
      <div class='alarm-center-detail-alarm-info-baseinfo'>
        <div class='block-title mt-24'>{t('基础信息')}</div>
        <div>
          <table>
            <tr>
              <td>{t('所属空间')}:</td>
              <td>{renderSpaceText.value}</td>
              <td>{t('告警状态')}:</td>
              <td>
                <span>{renderStatusText.value}</span>
                <Button
                  class='ml-8'
                  theme='primary'
                  text
                  onClick={handleShowProcessStatusDetail}
                >
                  <i
                    style='font-size: 12px'
                    class='icon-monitor icon-xiangqing1 mr-2'
                  />
                  {t('处理详情')}
                </Button>
              </td>
            </tr>
            <tr>
              <td>{t('首次异常')}:</td>
              <td>
                <span>{dayjs.tz(props.data.first_anomaly_time * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>
                <Tag class='ml-4'>{dayjs.tz(props.data.first_anomaly_time * 1000).format('Z')}</Tag>
              </td>
              <td>{t('当前阶段')}:</td>
              <td>
                {props.data.stage_display}
                <Button
                  class='ml-8'
                  theme='primary'
                  text
                  onClick={handleShowManualProcess}
                >
                  <i
                    style='font-size: 12px;'
                    class='icon-monitor icon-chuli mr-2'
                  />
                  {t('手动处理')}
                </Button>
                ,
                <Button
                  class='ml-8'
                  theme='primary'
                  text
                  onClick={handleShowAlarmDispath}
                >
                  <i
                    style='font-size: 12px;'
                    class='icon-monitor icon-fenpai mr-2'
                  />
                  {t('告警分派')}
                </Button>
              </td>
            </tr>
            <tr>
              <td>{t('告警产生')}:</td>
              <td>
                <span>{dayjs.tz(props.data.create_time * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>
                <Tag class='ml-4'>{dayjs.tz(props.data.create_time * 1000).format('Z')}</Tag>
              </td>
              <td>{t('通知人')}:</td>
              <td>{props.data.appointee?.join(',') || '--'}</td>
            </tr>
            <tr>
              <td>{t('持续时间')}:</td>
              <td>{props.data.duration}</td>
              <td>{t('关注人')}:</td>
              <td>
                <span class='follower-info'>
                  <span>{props.data.follower?.join(',') || '--'}</span>
                  {!!props.data.follower?.length && !!bkCollectConfigId.value && (
                    <span
                      class='fenxiang-btn'
                      onClick={handleToCollectDetail}
                    >
                      <span>{t('变更')}</span>
                      <span class='icon-monitor icon-fenxiang' />
                    </span>
                  )}
                </span>
              </td>
            </tr>
            <tr>
              <td>{t('告警标签')}:</td>
              <td colspan={3}>
                {props.data.tags.map(item => (
                  <Tag
                    key={item.key}
                    class='mr-4'
                    type='stroke'
                  >
                    {item.key}
                  </Tag>
                ))}
              </td>
            </tr>
          </table>
        </div>
        <ProcessStatusDetail
          v-model:isShow={isShowStatusDetail.value}
          data={actionInfo.value}
        />
        <ManualProcess
          v-model:isShow={isShowManualProcess.value}
          data={props.data}
        />
        <AlarmDispath
          v-model:isShow={isShowAlarmDispath.value}
          data={props.data}
        />
      </div>
    );
  },
});
