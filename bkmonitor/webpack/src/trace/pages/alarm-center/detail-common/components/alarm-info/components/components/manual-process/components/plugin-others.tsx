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

import { defineComponent, type PropType, reactive, shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { Form, Input, Loading } from 'bkui-vue';
import { getPluginTemplates } from 'monitor-api/modules/action';

import type { IActionParams, IActionConfig } from '../typing';

import './plugin-others.scss';

export default defineComponent({
  props: {
    actionParams: {
      type: Object as PropType<IActionParams>,
      required: true,
    },
    actionConfig: {
      type: Object as PropType<IActionConfig>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();

    const isPluginTemplateLoading = shallowRef(false);
    const pluginTemplateTitle = shallowRef('');
    const pluginTemplateName = shallowRef('');
    const formModel = reactive({
      templateId: '',
      timeout: 0,
    });
    const formRules = shallowRef({});
    const formItemList = shallowRef<IActionParams['params']>([]);

    const initFrom = async () => {
      if (!props.actionConfig) {
        return;
      }
      formItemList.value = [];
      for (const actionParamItem of props.actionParams.params) {
        const { key } = actionParamItem;
        if (key === 'ENABLED_NOTICE_WAYS' || key === 'MESSAGE_QUEUE_DSN') {
          // These keys are handled separately, so we skip them here
          continue;
        }

        formModel[actionParamItem.key] = actionParamItem.value;
        if (actionParamItem.rules?.length) {
          formRules.value[actionParamItem.key] = actionParamItem.rules;
        } else if (actionParamItem.formItemProps.required) {
          formRules.value[actionParamItem.key] = [
            {
              message: t('必填项'),
              required: true,
              trigger: 'blur',
            },
          ];
        }
        const formItem = { ...actionParamItem };
        if (formItem.type === 'tag-input') {
          formItem.formChildProps['allow-auto-match'] = true;
        } else if (formItem.type === 'switcher') {
          formItem.formChildProps.size = 'small';
        }

        formItemList.value.push(formItem);
      }

      formModel.templateId = props.actionParams.execute_config.template_id;
      formModel.timeout = props.actionParams.execute_config.timeout;

      if (props.actionParams.execute_config.origin_template_detail) {
        const obj = props.actionParams.execute_config.origin_template_detail;
        for (const formItem of formItemList.value) {
          const value = obj?.[formItem.key] || '';
          const list = value.match(/\{\{(.*?)\}\}/g);
          const varList = list?.filter((item, index, arr) => arr.indexOf(item, 0) === index) || [];
          if (varList.length) {
            formItem.formItemProps.label = `${formItem.formItemProps.label}    ${varList.join(',')}`;
          }
        }
      }
    };

    const fetchPluginTemplates = async () => {
      try {
        isPluginTemplateLoading.value = true;
        const result = await getPluginTemplates({
          bk_biz_id: props.actionConfig.bk_biz_id,
          plugin_id: props.actionConfig.plugin_id,
        });
        if (result) {
          pluginTemplateTitle.value = result.name;
          pluginTemplateName.value =
            result.templates.find(item => `${item.id}` === `${formModel.templateId}`)?.name || '';
        }
      } finally {
        isPluginTemplateLoading.value = false;
      }
    };

    watch(
      () => props.actionParams,
      () => {
        if (!props.actionParams) {
          return;
        }
        initFrom();
        fetchPluginTemplates();
      },
      {
        immediate: true,
      }
    );

    return () => {
      console.log('formItemList = ', formItemList.value);

      return (
        <div class='alarm-center-manual-process-plugin-others'>
          <Loading loading={isPluginTemplateLoading.value}>
            <Form.FormItem label={pluginTemplateTitle.value}>
              <Input
                behavior='simplicity'
                modelValue={pluginTemplateName.value}
                readonly
              />
            </Form.FormItem>
          </Loading>
          <div class='params-field-wrapper'>
            <div class='params-header'>{t('参数填写')}</div>
            <div class='params-item-wrapper'>
              {formItemList.value.map(item => (
                <Form.FormItem
                  key={item.key}
                  label={item.formItemProps.label}
                  property={item.formItemProps.property}
                  required={Boolean(item.formItemProps.required)}
                  rules={formRules.value[item.key]}
                >
                  <Input
                    behavior='simplicity'
                    placeholder={item.formChildProps.placeholder}
                  />
                </Form.FormItem>
              ))}
            </div>
          </div>
        </div>
      );
    };
  },
});
