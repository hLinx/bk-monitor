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
import { defineComponent, type PropType, watch } from 'vue';
import { computed } from 'vue';
import { shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { PrimaryTable, TableColumn } from '@blueking/tdesign-ui';
import { Dialog, Select, Loading, Button } from 'bkui-vue';
import dayjs from 'dayjs';
import _ from 'lodash';
import { subActionDetail } from 'monitor-api/modules/alert';
import { getNoticeWay } from 'monitor-api/modules/notice_group';

import './process-status-detail.scss';

const makeMap = (list: Array<string> = []): Record<string, boolean> => {
  const map = Object.create(null);
  for (const item of list) {
    map[item] = true;
  }
  return map;
};

const actionStatusMap = {
  success: window.i18n.t('成功'),
  failure: window.i18n.t('失败'),
};

export default defineComponent({
  props: {
    data: Object as PropType<{
      actions: {
        id: string;
        create_time: number;
        action_plugin: {
          id: number;
          name: string;
        };
        action_plugin_type: string;
        status: string;
        status_tips: string;
        operate_target_string: string;
      }[];
      total: number;
    }>,
    isShow: Boolean as PropType<boolean>,
  },
  emits: ['update:isShow'],
  setup(props, context) {
    const { t } = useI18n();

    const isLoading = shallowRef(false);
    const currentActionId = shallowRef('');
    const noticeWayList = shallowRef<{ label: string; type: string }[]>([]);
    const currentSubActionInfo = shallowRef<
      Record<
        string,
        Record<
          string,
          {
            action_id: string;
            status: string;
            status_display: string;
            status_tips: string;
          }
        >
      >
    >();

    const localActionList = computed(() => {
      return props.data.actions.map((item, index) => ({
        id: item.id,
        name: `${t('第 {n} 次', { n: props.data.total - index })}（${dayjs
          .tz(item.create_time * 1000)
          .format('YYYY-MM-DD HH:mm:ss')}）`,
      }));
    });

    const currentAcitonData = computed(() => _.find(props.data.actions, item => item.id === currentActionId.value));

    const processDetailTableData = computed(() => {
      return Object.entries(currentSubActionInfo.value || {}).map(([target, noticeWay]) => ({
        target,
        ...noticeWay,
      }));
    });

    const isNoticeType = computed(() => currentAcitonData.value?.action_plugin_type === 'notice');

    const renderNoticeWayList = computed(() => {
      // 不需要渲染所有的通知方式
      // sub action 返回对应的相关的通知方式才会渲染对应的列
      const allDataKeyMap: Record<string, boolean> = {};
      for (const item of processDetailTableData.value) {
        Object.assign(allDataKeyMap, makeMap(Object.keys(item)));
      }

      return _.filter(noticeWayList.value, item => allDataKeyMap[item.type]);
    });

    const fetchNoticeWay = async () => {
      noticeWayList.value = await getNoticeWay();
    };

    const fetchSubActionDetail = async () => {
      currentSubActionInfo.value = await subActionDetail({
        parent_action_id: currentActionId.value,
      });
    };

    watch(
      () => props.isShow,
      () => {
        if (!props.isShow) {
          return;
        }
        isLoading.value = true;
        setTimeout(() => {
          currentActionId.value = localActionList.value[0].id;
          Promise.all([fetchNoticeWay(), fetchSubActionDetail()]).finally(() => {
            isLoading.value = false;
          });
        });
      }
    );

    watch(currentActionId, async () => {
      try {
        isLoading.value = true;
        await fetchSubActionDetail();
      } finally {
        isLoading.value = false;
      }
    });

    const handleClose = () => {
      context.emit('update:isShow', false);
    };

    const renderNoticTable = () => (
      <PrimaryTable
        data={processDetailTableData.value}
        rowKey='target'
      >
        <TableColumn
          colKey='target'
          title={t('通知对象')}
        />
        {renderNoticeWayList.value.map(item => (
          <TableColumn
            key={item.label}
            colKey={item.type}
            title={item.label}
          >
            {{
              default: ({ row, col }) => {
                const data = row[col.colKey];
                return (
                  <span
                    class={`notice-${data.status}`}
                    v-bk-tooltips={{
                      allowHtml: false,
                      html: false,
                      allowHTML: false,
                      width: 200,
                      content: data.status_tips || '',
                      placements: ['top'],
                      disabled: !data.status_tips,
                    }}
                  >
                    {data.status_display}
                  </span>
                );
              },
            }}
          </TableColumn>
        ))}
      </PrimaryTable>
    );

    const renderActionTable = () => (
      <PrimaryTable
        data={[currentAcitonData.value]}
        rowKey='id'
      >
        <TableColumn
          colKey='action_plugin.name'
          title={t('套餐类型')}
        />
        <TableColumn
          colKey='operate_target_string'
          title={t('执行对象')}
        />
        <TableColumn
          colKey='operator'
          title={t('负责人')}
        >
          {{
            default: ({ row }) => row.operator?.join(';'),
          }}
        </TableColumn>
        <TableColumn
          colKey='status'
          title={t('执行状态')}
        >
          {{
            default: ({ row }) => (
              <span
                class={['action-status', row.status]}
                v-bk-tooltips={{
                  content: row.status_tips,
                  disabled: row.status !== 'failure',
                  width: 200,
                  allowHtml: false,
                  html: false,
                  allowHTML: false,
                }}
              >
                {actionStatusMap[row.status]}
              </span>
            ),
          }}
        </TableColumn>
      </PrimaryTable>
    );

    return () => (
      <Dialog
        width={800}
        class='alarm-center-process-status-detail-dialog'
        is-show={props.isShow}
        title={t('处理状态详情')}
        onClosed={handleClose}
      >
        {{
          default: () => (
            <Loading loading={isLoading.value}>
              <div class='process-times mb-24'>
                <div class='mr-24'>{t('处理次数')}</div>
                <Select
                  style='flex: 1'
                  v-model={currentActionId.value}
                  clearable={false}
                >
                  {localActionList.value.map(item => (
                    <Select.Option
                      id={item.id}
                      key={item.id}
                      name={item.name}
                    />
                  ))}
                </Select>
              </div>
              <div class='mb-16'>{t('处理明细')}</div>
              {currentAcitonData.value && (isNoticeType.value ? renderNoticTable() : renderActionTable())}
            </Loading>
          ),
          footer: () => <Button onClick={handleClose}>{t('关闭')}</Button>,
        }}
      </Dialog>
    );
  },
});
