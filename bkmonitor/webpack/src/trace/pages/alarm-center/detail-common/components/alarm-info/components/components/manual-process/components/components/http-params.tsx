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

import { PrimaryTable, TableColumn } from '@blueking/tdesign-ui';
import { Input } from 'bkui-vue';

const columnList = [
  {
    label: '',
    prop: 'isEnabled',
    width: 31,
  },
  {
    label: `${window.i18n.t('字段名')}`,
    prop: 'key',
  },
  {
    label: `${window.i18n.t('值')}`,
    prop: 'value',
  },
  {
    label: `${window.i18n.t('描述')}`,
    prop: 'desc',
  },
  {
    label: '',
    prop: 'handle',
    width: 48,
  },
];

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<{
        queryParams: {
          isEnabled: boolean;
          key: string;
          value: string;
        }[];
      }>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <PrimaryTable
        data={props.modelValue.queryParams}
        rowKey='index'
      >
        {columnList.map(column => (
          <TableColumn
            key={column.prop}
            width={column.width}
            colKey={column.prop}
            title={column.label}
          >
            {{
              default: ({ col }: { col: { colKey: string } }) => {
                if (!column.label) {
                  return null;
                }
                return (
                  <Input
                    v-model={props.modelValue.queryParams[0][col.colKey]}
                    behavior='simplicity'
                  />
                );
              },
            }}
          </TableColumn>
        ))}
      </PrimaryTable>
    );
  },
});
