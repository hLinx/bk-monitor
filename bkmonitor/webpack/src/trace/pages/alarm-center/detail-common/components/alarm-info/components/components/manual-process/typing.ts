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
export interface IActionConfig {
  app: string;
  bk_biz_id: number;
  config_source: string;
  delete_allowed: boolean;
  desc: string;
  edit_allowed: boolean;
  execute_count: number;
  id: number;
  is_enabled: boolean;
  name: string;
  plugin_id: number;
  plugin_name: string;
  plugin_type: string;
  strategy_count: number;
  update_time: string;
  update_user: string;
}

export interface IActionParams {
  app: string;
  bk_biz_id: number;
  create_time: string;
  config_source: string;
  delete_allowed: boolean;
  desc: string;
  execute_config: {
    origin_template_detail: Record<string, any>;
    template_detail: Record<string, any>;
    timeout: number;
    template_id: string;
  };
  hash: string;
  id: number;
  is_builtin: boolean;
  is_deleted: boolean;
  is_enabled: boolean;
  name: string;
  params: {
    formChildProps: {
      placeholder: string;
    };
    formItemProps: {
      help_text: string;
      label: string;
      property: string;
      required: boolean;
    };
    key: string;
    rules: { message: string; required: boolean; trigger: string }[];
    type: string;
    value: string;
  }[];
  path: string;
  plugin_id: number;
  plugin_name: string;
  plugin_type: string;
  snippet: string;
  update_time: string;
  update_user: string;
}
