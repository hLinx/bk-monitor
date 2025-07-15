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
import { defineComponent, onMounted, onBeforeUnmount, useTemplateRef } from 'vue';
import { shallowRef, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { listActionConfig } from 'monitor-api/modules/model';
import tippy, { type SingleTarget, type Instance } from 'tippy.js';

import type { IActionConfig } from '../typing';

import './action-config-select.scss';

const groupByPluginActionConfig = (data: IActionConfig[]) => {
  return data.reduce<Record<string, IActionConfig[]>>((result, item) => {
    if (!result[item.plugin_name]) {
      result[item.plugin_name] = [];
    }
    result[item.plugin_name].push(item);
    return result;
  }, {});
};

export default defineComponent({
  props: {
    data: {
      type: Object as () => { bk_biz_id: number },
      required: true,
    },
  },
  emits: ['change'],
  setup(props, context) {
    let tippyInstance: Instance;

    const { t } = useI18n();

    const rootRef = useTemplateRef<HTMLElement>('root');
    const panelRef = useTemplateRef<HTMLElement>('panel');
    const panelWidth = shallowRef(120);
    const actionPluginMap = shallowRef<Record<string, IActionConfig[]>>({});
    const currentPluginName = shallowRef('');
    const currentConfig = shallowRef<IActionConfig>();

    const currentActionConfigList = computed(() => actionPluginMap.value[currentPluginName.value] || []);

    const fetchActionConfig = async () => {
      const result = await listActionConfig({
        bk_biz_id: props.data.bk_biz_id,
      });
      actionPluginMap.value = groupByPluginActionConfig(result);
    };

    fetchActionConfig();

    const handleSelectPlugin = (pluginName: string) => {
      currentPluginName.value = pluginName;
    };

    const handleSelectConfig = (item: IActionConfig) => {
      console.log('Selected Action Config:', item);
      currentConfig.value = item;
      context.emit('change', item);
      tippyInstance.hide();
    };

    onMounted(() => {
      tippyInstance = tippy(rootRef.value as SingleTarget, {
        content: panelRef.value as any,
        trigger: 'click',
        placement: 'bottom',
        theme: 'light alarm-center-action-config-select-panel',
        interactive: true,
        hideOnClick: true,
        arrow: false,
        zIndex: 99999,
        maxWidth: 'none',
        onShow() {
          panelWidth.value = rootRef.value.getBoundingClientRect().width;
        },
        appendTo: () => document.body,
      });
    });

    onBeforeUnmount(() => {
      tippyInstance.hide();
      tippyInstance.destroy();
    });

    return () => (
      <div class='alarm-center-action-config-select'>
        <div
          ref='root'
          class='value-box'
        >
          {currentConfig.value ? (
            <>
              <span>{currentConfig.value.name}</span>
              <span
                style='color: #8e8e93'
                class='ml-4'
              >
                ({currentConfig.value.plugin_name})
              </span>
            </>
          ) : (
            t('请选择套餐')
          )}
        </div>
        <div ref='panel'>
          <div
            style={{ width: `${panelWidth.value}px` }}
            class='select-layout'
          >
            <div class='plugin-box'>
              {Object.keys(actionPluginMap.value).map(pluginName => (
                <div
                  key={pluginName}
                  class={{
                    'select-item': true,
                    'is-active': currentPluginName.value === pluginName,
                  }}
                  onClick={() => handleSelectPlugin(pluginName)}
                >
                  <div>{pluginName}</div>
                  <i
                    style='margin-left: auto'
                    class='icon-monitor icon-arrow-right'
                  />
                </div>
              ))}
            </div>
            <div class='action-config-box'>
              {currentActionConfigList.value.map(item => (
                <div
                  key={item.id}
                  class={{
                    'select-item': true,
                    'is-active': currentConfig.value?.id === item.id,
                  }}
                  onClick={() => handleSelectConfig(item)}
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
