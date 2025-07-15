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
import { defineComponent, type PropType, shallowRef, watch } from 'vue';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import BkUserSelector from '@page/alarm-shield/components/member-selector';
import { Dialog, Checkbox, Loading, Button, Form, Input, Tag, Message } from 'bkui-vue';
import _ from 'lodash';
import { assignAlert } from 'monitor-api/modules/action';
import { getNoticeWay } from 'monitor-api/modules/notice_group';

import './alarm-dispatch.scss';

const reasonQuickTagList = [
  window.i18n.t('当前工作安排较多'),
  window.i18n.t('不在职责范围内'),
  window.i18n.t('无法处理'),
];

export default defineComponent({
  props: {
    isShow: Boolean as PropType<boolean>,
    data: {
      type: Object as PropType<{
        bk_biz_id: number;
        id: string;
        incident_id: number;
        alert_name: string;
      }>,
      required: true,
    },
  },
  emits: ['update:isShow'],
  setup(props, context) {
    const { t } = useI18n();

    const isLoading = shallowRef(false);
    const isSubmiting = shallowRef(false);
    const formRef = shallowRef<InstanceType<typeof Form>>();
    const noticeWayList = shallowRef<{ label: string; type: string }[]>([]);
    const fromData = reactive({
      appointees: [] as string[],
      reason: '',
      notice_ways: [] as string[],
    });

    const fetchNoticeWayList = async () => {
      try {
        isLoading.value = true;
        const result = await getNoticeWay();
        noticeWayList.value = _.filter(result, item => item.type !== 'wxwork-bot');
      } finally {
        isLoading.value = false;
      }
    };

    watch(
      () => props.isShow,
      () => {
        if (props.isShow) {
          fetchNoticeWayList();
        }
      }
    );

    const handleQuickEditReason = (value: string) => {
      fromData.reason = !fromData.reason ? value : `${fromData.reason}, ${value}`;
    };

    const handleSubmit = async () => {
      try {
        isSubmiting.value = true;
        await formRef.value.validate();
        await assignAlert({
          bk_biz_id: props.data.bk_biz_id,
          alert_ids: [props.data.id],
          ...fromData,
        });

        context.emit('update:isShow', false);
        Message({
          theme: 'success',
          message: t('分派成功'),
        });
      } finally {
        isSubmiting.value = false;
      }
    };

    const handleCancel = () => {
      context.emit('update:isShow', false);
    };

    return () => (
      <Dialog
        width={480}
        class='alarm-center-alarm-dispatch-dialog'
        isShow={props.isShow}
        quick-close={false}
        title={t('告警分派')}
        onClosed={handleCancel}
      >
        {{
          default: () => (
            <Loading loading={isLoading.value}>
              <Form
                ref={formRef}
                formType='vertical'
                model={fromData}
              >
                <Form.FormItem
                  label={t('分派人员')}
                  property='appointees'
                  required={true}
                >
                  <BkUserSelector
                    v-model={fromData.appointees}
                    api={`${window.site_url}rest/v2/commons/user/list_users/`}
                    empty-text={t('搜索结果为空')}
                  />
                </Form.FormItem>
                <Form.FormItem
                  label={t('分派原因')}
                  property='reason'
                  required={true}
                >
                  <div>
                    {reasonQuickTagList.map(item => (
                      <Tag
                        key={item}
                        {...{
                          onClick: () => handleQuickEditReason(item),
                        }}
                      >
                        {item}
                      </Tag>
                    ))}
                  </div>
                  <Input
                    v-model={fromData.reason}
                    maxlength={100}
                    placeholder={t('请输入')}
                    rows={3}
                    type='textarea'
                  />
                </Form.FormItem>
                <Form.FormItem
                  label={t('通知方式')}
                  property='notice_ways'
                  required={true}
                >
                  <Checkbox.Group v-model={fromData.notice_ways}>
                    {noticeWayList.value.map(item => (
                      <Checkbox
                        key={item.type}
                        label={item.type}
                      >
                        {item.label}
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                </Form.FormItem>
              </Form>
            </Loading>
          ),
          footer: () => (
            <>
              <Button
                theme='primary'
                onClick={handleSubmit}
              >
                {t('确定')}
              </Button>
              <Button
                class='ml-8'
                onClick={handleCancel}
              >
                {t('取消')}
              </Button>
            </>
          ),
        }}
      </Dialog>
    );
  },
});
