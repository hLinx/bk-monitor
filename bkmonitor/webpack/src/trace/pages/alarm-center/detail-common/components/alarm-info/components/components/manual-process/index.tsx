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

import { Dialog, Loading, Button, Form } from 'bkui-vue';
import { getActionParams, getPluginTemplates } from 'monitor-api/modules/action';
import { listActionConfig } from 'monitor-api/modules/model';
import { random, transformDataKey } from 'monitor-common/utils/utils';

import ActionConfigSelect from './components/action-config-select';
import PluginOthers from './components/plugin-others';
import PluginWebHook from './components/plugin-web-hook';

import type { IActionConfig, IActionParams } from './typing';

import './index.scss';

const genTemplateDateDefault = () => ({
  name: '',
  id: '',
  allList: {} as unknown as Record<string, any[]>,
});

const genWebKook = () => ({
  res: {
    headers: [],
    queryParams: [],
    authorize: {
      authConfig: {},
      authType: 'none',
    },
    body: {
      dataType: 'default',
      contentType: 'default',
      content: '',
      params: [],
    },
    failedRetry: {
      maxRetryTimes: 2,
      needPoll: false,
      notifyInterval: 120,
      retryInterval: 2,
      timeout: 10,
    },
    url: '',
    method: 'GET',
  },
});

export default defineComponent({
  props: {
    isShow: Boolean as PropType<boolean>,
    data: {
      type: Object as PropType<{
        bk_biz_id: number;
        id: string;
      }>,
      required: true,
    },
  },
  emits: ['update:isShow'],
  setup(props, context) {
    const { t } = useI18n();

    const isLoading = shallowRef(false);
    const isActionParamsLoading = shallowRef(false);
    const currentActionConfig = shallowRef<IActionConfig>();
    const actionParams = shallowRef<IActionParams>();
    const webHookKey = shallowRef<string>(random(8));
    const templateData = shallowRef<{
      name: string;
      id: string;
      allList: { [pulginId: string]: any[] };
    }>(genTemplateDateDefault());

    watch(
      () => props.isShow,
      () => {
        templateData.value = genTemplateDateDefault();
      },
      {
        immediate: true,
      }
    );

    const handleConfigChange = async (payload: IActionConfig) => {
      currentActionConfig.value = payload;
      isActionParamsLoading.value = true;
      try {
        const result: IActionParams[] = await getActionParams({
          bk_biz_id: props.data.bk_biz_id,
          alert_ids: [props.data.id],
          config_ids: [payload.id],
        });
        actionParams.value = result[0];
        console.log('Action Params handleConfigChange:', result);
      } finally {
        isActionParamsLoading.value = false;
      }
    };

    const handleCancel = () => {
      context.emit('update:isShow', false);
    };

    return () => (
      <Dialog
        width={800}
        class='alarm-center-manual-process-dialog'
        isShow={props.isShow}
        title={t('手动处理')}
        onClosed={handleCancel}
      >
        {{
          default: () => {
            const renderPlugin = () => {
              if (!currentActionConfig.value || !actionParams.value) {
                return null;
              }
              if (currentActionConfig.value.plugin_type === 'webhook') {
                return (
                  <PluginWebHook
                    key={webHookKey.value}
                    actionConfig={currentActionConfig.value}
                    actionParams={actionParams.value}
                  />
                );
              }
              return (
                <PluginOthers
                  key={webHookKey.value}
                  actionConfig={currentActionConfig.value}
                  actionParams={actionParams.value}
                />
              );
            };
            return (
              <Loading loading={isLoading.value}>
                <Form formType='vertical'>
                  <Form.FormItem
                    label={t('处理套餐')}
                    required={true}
                  >
                    <ActionConfigSelect
                      data={props.data}
                      onChange={handleConfigChange}
                    />
                  </Form.FormItem>
                  <Loading loading={isActionParamsLoading.value}>{renderPlugin()}</Loading>
                </Form>
              </Loading>
            );
          },
          footer: () => (
            <>
              <Button theme='primary'>{t('确定')}</Button>
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
