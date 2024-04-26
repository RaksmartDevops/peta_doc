/**
 * KEY定义是：根据产品的定位和文档的类型去定义文档KEY
 * 使用在页面上方的使用指南 用 *guide* 来进行描述
 * 页面中使用的产品文档： manual/intro
 * 产品的计费文档：billing
 * 公共服务：public
 * 产品新闻动态：news
 * 类型有：
 * guide： 使用指南
 * manual/intro： 页面中使用的文档
 * news： 新闻动态
 * billing： 产品计费文档
 * public： 公共服务，与业务不太相关
 * faq： F&Q
 */
module.exports = {
  /**
   * 流量牵引服务
   */
  // 流量牵引服务-网络服务实例列表
  network_mms_example_guide: '/network/mcn/manual/create_mcn/', // ！！地址不存在
  // 流量牵引服务-配置案例
  network_mms_enable_eip_guide: '/network/mcn/manual/enable_eip/', // ！！地址不存在
  // 流量牵引服务-EIP列表
  network_mms_eip_guide: '/network/mcn/manual/enable_eip/', // ！！地址不存在

  /**
   * 大数据工作台
   */
  // 大数据
  bigdata_dataomnis_data_summary_manual: '/bigdata/dataomnis/manual/data_up_cloud/data_summary/', // ！！地址不存在
  // 数据开发
  bigdata_dataomnis_data_development_manual: '/bigdata/dataomnis/manual/data_development/summary/', // ！！地址不存在
  // 其他常见问题
  bigdata_dataomnis_databench_faq: '/bigdata/dataomnis/databench/faq/ ', // ！！地址不存在
  // 大数据工作台
  bigdata_dataomnis_overview_guide: '/bigdata/dataomnis/manual/overview/',
  // 大数据工作台 工作空间
  bigdata_dataomnis_workspace_guide: '/bigdata/dataomnis/manual/workspace_list/',
  // 大数据工作台的基本概念
  bigdata_dataomnis_concept_manual: '/bigdata/dataomnis/intro/concept/',
  //大数据工作台 准备工作
  bigdata_dataomnis_preparation_manual: '/bigdata/dataomnis/prepare/create_account/',
  // 数据开发流程
  bigdata_dataomnis_development_process_manual: '/bigdata/dataomnis/intro/development_process/',
  // 使用限制
  bigdata_dataomnis_restriction_manual: '/bigdata/dataomnis/intro/restriction/',
  // 更多帮助指引
  bigdata_dataomnis_introduction_manual: '/bigdata/dataomnis/intro/introduction/',
  // 实时同步 MySQL 数据到 Elasticsearch 场景介绍
  bigdata_dataomnis_mysql_practice01_manual: '/bigdata/dataomnis/best-practices/practice01/summary/',
  // 实时计算 uv、pv、转化率（SQL 作业）`
  bigdata_dataomnis_practice02_manual: '/bigdata/dataomnis/best-practices/practice02/summary/',
  // 快速上手视频
  bigdata_dataomnis_video_manual: '/bigdata/dataomnis/video/video/',
  // 大数据工作台
  bigdata_dataomnis_overview_news: '/bigdata/dataomnis/news/product_news/',
  bigdata_dataomnis_price_billing: '/bigdata/dataomnis/billing/price/',
  bigdata_qingmr_guide: '/bigdata/qingmr/',
  bigdata_elk_guide: '/bigdata/elk/',
  bigdata_opensearch_guide: '/bigdata/opensearch/',
  bigdata_hbase_guide: '/bigdata/hbase/',
  bigdata_zookeeper_guide: '/middware/zookeeper/',
  bigdata_kyligence_guide: '/bigdata/kyligence/',
  bigdata_nifi_guide: '/bigdata/nifi/', //  ！！地址不存在
  bigdata_storm_guide: '/bigdata/storm/', //  ！！地址不存在

  /**
   * loadbalancer
   */
  // 转发策略 ??这些地址定位不是很清楚
  network_loadbalancer_policies_guide: '/network/loadbalancer/manual/forward_rule/intro/',
  // 服务器证书 ??这些地址定位不是很清楚
  network_loadbalancer_server_certificates_guide: '/network/loadbalancer/',
  // 负载均衡
  network_loadbalancer_guide: '/network/loadbalancer/',
  network_loadbalancer_manual:
    '/network/loadbalancer/manual/lb_user_guide/#rsyslog-%E8%BF%9C%E7%AB%AF%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8',
  network_loadbalancer_price_billing: '/network/loadbalancer/billing/price/',

  /**
   * cdn
   */
  // 清除 CDN 缓存 ??这些地址定位不是很清楚
  network_cdn_purges_guide: '/network/cdn/',
  // 内容预取 ??这些地址定位不是很清楚
  network_cdn_prefetches_guide: '/network/cdn/',
  // 域名管理 ??这些地址定位不是很清楚
  network_cdn_domains_guide: '/network/cdn/',
  // 证书 ??这些地址定位不是很清楚
  network_cdn_certs_guide: '/network/cdn/',
  // CDN 服务
  network_cdn_guide: '/network/cdn/',
  network_cdn_price_billing: '/network/cdn/billing/price/',

  /**
   * image
   */
  compute_images_system_guide: '/compute/image/intro/image/',
  // ??这些地址定位不是很清楚
  compute_images_self_guide: '/compute/image/intro/image/',
  // ??这些地址定位不是很清楚
  compute_images_shared_guide: '/compute/image/intro/image/',

  /**
   * 实时音视频 RTC
   */
  // 实时音视频 RTC
  rtc_guide: '/audio_and_video/rtc/',
  // 消费明细
  rtc_demand_consumption_guide: '/audio_and_video/vod/um/bill_list/20_view_bill/', // ！！地址不存在
  //用量统计
  rtc_statistics_guide: '/audio_and_video/rtc/usermanual/50_view_usage/',
  // 应用管理
  rtc_application_guide: '/audio_and_video/rtc/usermanual/20_mgmt_app/',
  // 套餐包管理
  rtc_package_guide: '/audio_and_video/rtc/usermanual/10_purchase/',
  // 视频直播
  // rtc_live_cdn_guide: '',
  // 云点播-音视频管理
  rtc_demand_management_guide: '/audio_and_video/vod/um/mgmt_video/10_upload/',
  // 任务流
  rtc_demand_task_guide: '/audio_and_video/vod/um/mgmt_task/10_create_task/',
  // 模版管理
  rtc_demand_template_guide: '/audio_and_video/vod/um/mgmt_tempt/10_create_video/',
  // 域名管理
  rtc_demand_domain_guide: '/audio_and_video/vod/um/mgmt_domain/10_add_domain/',
  // 刷新预热
  rtc_demand_refresh_hot_guide: '/audio_and_video/vod/um/refresh_hot/10_refresh_cache/',
  // 日志管理
  rtc_demand_logs_guide: '/audio_and_video/vod/um/mgmt_log/10_view_log/',
  // 回调设置
  rtc_demand_callback_guide: '/audio_and_video/vod/um/callback_settting/10_callback_list/',
  // 用量统计
  rtc_demand_statistics_guide: '/audio_and_video/vod/um/usage_statistics/10_view_usage/',
  // 资源包管理
  rtc_demand_resources_guide: '/audio_and_video/vod/um/bill_list/10_purchase_source/',
  // 产品概览
  rtc_intro_manual: '/audio_and_video/rtc/intro/10_rtc/',
  // 新手指引
  rtc_novice_demo_manual: '/audio_and_video/rtc/qs/10_qs_rtc/',
  // sdk
  rtc_sdk_manual: '/audio_and_video/rtc/sdk/10_sdk/',
  // 回调鉴权文档
  rtc_demand_callbac_event_manual: '/audio_and_video/vod/api/70_callbac_event/parameters/',

  /**
   * cfw
   */
  security_cfw_guide: '/security/firewall/',
  // 互联网防火墙
  security_cfw_net_firewall_guide: '/security/firewall/manual/cfw/',
  // 入侵防御策略
  security_cfw_attck_protect_guide: '/security/firewall/manual/attck_protect/',
  // 流量控制策略
  security_cfw_traffic_policy_guide: '/security/firewall/manual/flow/',
  // 黑白名单
  security_cfw_black_white_list_guide: '/security/firewall/manual/black_white_list/',
  // 地址簿
  security_cfw_address_book_guide: '/security/firewall/manual/management/',
  // 通用管理
  security_cfw_service_port_local_guide: '/security/firewall/manual/management/',
  // 通用管理
  security_cfw_applications_guide: '/security/firewall/manual/management/',
  // 安全日志
  security_cfw_security_log_guide: '/security/firewall/manual/logs/logs_security/',
  // 流量日志
  security_cfw_traffic_log_guide: '/security/firewall/manual/logs/logs_traffic/',
  // 操作日志
  security_cfw_operation_dialog_guide: '/security/firewall/manual/logs/logs_operations/',
  // 产品设置
  security_cfw_product_setting_guide: '/security/firewall/manual/others/',
  security_cfw_firewall_faq: '/security/firewall/faq/faq/',
  security_cfw_price_billing: '/security/firewall/billing/price/',
  // 防火墙 安全策略
  security_cfw_firewall_safety_manual: '/security/firewall/quick-start/safety/',
  // 配置远端主机
  security_cfw_remote_host_manual: '/security/firewall/manual/rsyslog/',

  /**
   * 高防ip ddosip
   */
  // 高防ip
  security_ddosip_guide: '/security/antiddos_ip/',
  // -实例列表
  security_ddosip_instance_guide: '/security/antiddos_ip/quickstart/antiddos_create/',
  // 业务接入
  security_ddosip_service_access_guide: 'security/antiddos_ip/manual/servics_access_mgt/domain_servics_delete/',
  // 域名过白
  security_ddosip_domain_defense_guide: '/security/antiddos_ip/manual/domain_defense/',
  // 监控视图
  security_ddosip_monitor_view_guide: '/security/antiddos_ip/manual/antiddos_view/',
  //    查看实例教程
  security_ddosip_course_manual: '/security/antiddos_ip/quickstart/antiddos_access/',
  security_ddosip_price_billing: '/security/antiddos_ip/billing/price/',

  /**
   * 安全资源池srp
   */
  security_srp_ahvlog_guide: '/security/srp/ahvlog/create/',
  security_srp_ahvngfw_guide: '/security/srp/ahvngfw/create/',
  security_srp_ahvwaf_guide: '/security/srp/ahvwaf/create/',
  security_srp_ahvusm_guide: '/security/srp/ahvusm/create/',
  security_srp_ahvras_guide: '/security/srp/ahvras/create/',
  security_srp_ahvdb_guide: '/security/srp/ahvdb/create/',
  security_srp_ahvedr_guide: '/security/srp/ahvedr/create/',
  security_srp_ahvngfw_eip_guide: '/security/srp/ahvngfw/config/eip/',
  security_srp_ahvedr_vm_protection_guide: '/security/srp/ahvedr/vm_protection/',
  security_srp_opration_log_guide: '/security/srp/opration_log/operation_log/',
  security_srp_product_price_billing: '/security/srp/billing/price/',
  security_srp_ahvdb_protection_guide: '/security/srp/ahvdb/vdb_protection/',

  /**
   * 云服务器
   */
  compute_instances_guide: '/compute/vm/',
  // 云服务预留合约使用指南
  compute_instances_reserved_contracts_guide: '/compute/vm/billing/reserved_contract/',
  // 云服务安置策略组使用指南
  compute_instances_instance_groups_guide: '/compute/instance_group/',
  // 自定义数据
  compute_instances_userdata_manual: '/compute/vm/manual/vm/70_userdata/',
  // 终止合约
  compute_instances_reserved_termination_contracts_guide:
    '/compute/vm/billing/reserved_contract/#%E7%BB%88%E6%AD%A2%E5%90%88%E7%BA%A6',
  compute_instances_news: '/compute/vm/news/product_news/',
  // 云服务器介绍
  compute_instances_intro: '/compute/vm/intro/instance/',
  compute_instances_free_after_shutdown_faq: '/compute/vm/faq/other_questions/vm_free_after_shutdown/',
  compute_instances_ssh_key_faq: '/compute/vm/faq/troubleshooting/connect_manage/ssh_key/',
  compute_instances_port_80_disabled_faq: '/compute/vm/faq/common_operations/os_func_manage/port_80_disabled/',
  compute_instances_server_func_cpu_instruction_set_faq:
    '/compute/vm/faq/common_operations/server_func/cpu_instruction_set/',
  compute_instances_nic_multi_faq: '/compute/vm/faq/other_questions/nic_multi/',
  compute_instances_cpu_instruction_set_faq: '/compute/vm/faq/cpu_instruction_set/',
  compute_instances_nic_manual: '/compute/vm/manual/nic/',

  // SSH密钥
  compute_ssh_guide: '/compute/ssh/intro/ssh/',
  // 网卡
  compute_net_card_guide: '/compute/vm/manual/net_card/nic/',
  // 专属宿主机组 ?? 地址
  compute_dedicated_host_guide: '/compute/dedicated_host/', // ！！地址不存在

  /**
   * NAT 网关
   */
  // NAT 网关
  network_nat_gateway_guide: '/network/nat_gateway/', // 网络流量镜像
  // SNAT 功能
  network_nat_gateway_snat_manual: '/network/nat_gateway/quickstart/snat_qs/',
  network_nat_gateway_specification_intro: '/network/nat_gateway/intro/specification/',
  network_nat_gateway_price_billing: '/network/nat_gateway/billing/nat_price/',

  /**
   * VPC
   */
  network_vpc_guide: '/network/vpc/',
  // GRE 隧道应用示例
  network_vpc_tunnel_gre_manual: '/network/vpc/manual/tunnel/gre/',
  //    network_vxnet_guide 修改为 network_vpc_vxnet_guide
  network_vpc_vxnet_guide: '/network/vpc/',
  network_vpc_shared_guide: '/network/vpc/',
  network_vpc_vip_manual: '/network/vpc/manual/route_table/',
  network_vpc_network_between_vms_faq: '/network/vpc/faq/network_between_vms/',
  network_vpc_vpn_manual: '/network/vpc/manual/vpn/',
  // 虚拟 IP 概述
  network_vpc_routing_tables_guide: '/network/vpc/manual/vip/01_vip_description/',
  // vpc_vip 概述
  network_vpc_vip_guide: '/network/vpc/manual/vip/02_use_vpc_vip/',
  // vpc_base_vip 概述
  network_vpc_base_vip_guide: '/network/vpc/manual/vip/03_use_basic_vip/',
  // 网络规划
  network_vpc_plan_manual: '/network/vpc/quick-start/10_qs_net_plan/',
  // vpc网络计费
  network_vpc_price_billing: '/network/vpc/billing/price/',

  /**
   * 公网 IP
   */
  // 公网 IPv6 ??这些地址定位不是很清楚
  network_eip_ipv6_guide: '/network/eip/',
  //    network_ipv4_guide 修改为  network_eip_ipv4_guide
  network_eip_ipv4_guide: '/network/eip/',
  // 搭建 IPv6 网络并开通公网访问
  network_eip_ipv6: '/network/eip/quickstart/ipv6_quick_start/',
  // 内部绑定公网 IP
  network_eips_inband_ipv4_manual: '/network/eip/manual/ipv4/inband_ipv4/',

  // 怎样开启文档多队列
  network_card_multi_queue_faq: '/product/faq/#nic-multi-queue',
  // 边界路由器
  network_border_router_guide: '/network/border_router/',
  // VPN服务指南
  network_vpn_routers_manual: '/network/vpc/manual/vpn/vpn_intro/',
  // 内网路由策略
  network_border_router_manual: '/network/border_router/manual/border_user_guide/#配置内网路由策略',
  // 网络流量镜像
  network_spans_guide: '/network/vpc/manual/span/',

  /**
   * 云解析
   */
  // 云解析 DNS-域名解析
  domain_dns_function_guide: '/site/dns/intro/dns_function/',
  // 全局负载均衡
  domain_gslb_function_guide: '/site/dns/intro/gslb_function/',
  // ssl-我的证书
  domain_ssl_introduction_guide: '/site/ssl/intro/introduction/',
  // 共享证书
  domain_ssl_introduction_share_guide: '/site/ssl/intro/introduction/#share',
  // 订单列表
  domain_ssl_orders_guide: '/site/ssl/manual/user_guide/',
  // 备案-材料
  domain_icp_prepare_material_manual: '/site/record/prepare/prepare_material/',
  // 准备备案云服务器
  domain_icp_prepare_vm_manual: '/site/record/prepare/prepare_vm/',
  // 域名-实名认证指南
  domain_realname_authen_manual: '/site/domain/realname_authen/ra_concept/',
  // 域名命名规则
  domain_naming_rule_manual: '/site/domain/dn_regist/naming_rule/',

  // 域名备案审核规范
  domain_dn_record_faq: '/site/domain/faq/dn_record/',

  /**
   * qke
   */
  qke_doc_use_guide: '/user_guide/container/qke_plus/intro/introduction/',
  qke_doc_create_region_intro: '/user_guide/operation/resource/intro/region_intro/',
  qke_doc_question_more_help_faq: '/user_guide/container/qke_plus/faq/cluster_faq/',
  qke_doc_question_5_faq: '/user_guide/container/qke_plus/faq/cluster_faq/',
  qke_doc_create_billing_elastic_intro: '/user_guide/services/bill_center/bill_guide/according_need/',
  qke_doc_create_billing_monthly_intro: '/user_guide/services/bill_center/bill_guide/reserved/',
  qke_doc_create_hosting_cluster_faq: '/user_guide/container/qke_plus/quickstart/create_hosting_cluster/',
  qke_doc_create_selfmgt_cluster_faq: '/user_guide/container/qke_plus/quickstart/create_selfmgt_cluster/',
  qke_doc_create_billing_desp_intro: '/user_guide/container/qke_plus/billing/bill_des/',
  qke_doc_after_sale_desp_intro: '/user_guide/container/qke_plus/contracts/aftersale_scope/',
  qke_doc_aply_scenarios_faq_cicd: '/user_guide/container/qke_plus/intro/aply_scenarios/#_cicd_应用场景',
  qke_doc_aply_scenarios_faq_serverless: '/user_guide/container/qke_plus/intro/aply_scenarios/#_微服务应用场景',
  qke_doc_aply_scenarios_faq_hybrid_cloud: '/user_guide/container/qke_plus/intro/aply_scenarios/#_混合多云多集群场景',
  qke_doc_aply_scenarios_faq_ai: '/user_guide/container/qke_plus/intro/aply_scenarios/#_ai_应用场景',
  qke_doc_how_use_ks_faq: '/user_guide/container/qke_plus/best-practice/how_use_ks/',
  qke_doc_question_deploy_image_faq: '/user_guide/container/qke_plus/faq/container_faq/',
  qke_doc_mg_service_faq: '/user_guide/container/qke_plus/manual/service/lb_service/',
  qke_doc_cfg_mirror_repo_manual: '/user_guide/container/qke_plus/quickstart/cfg_mirror_repo/',
  qke_doc_create_app_faq: '/user_guide/container/qke_plus/quickstart/create_app/',
  //-------------- 以下为覆盖后遗漏字段
  create_hosting_cluste: '/user_guide/container/qke_plus/intro/introduction/',
  qke_doc_deploy_image_faq: '/user_guide/container/qke_plus/faq/container_faq/',
  qke_doc_deploy_ks_faq: '/user_guide/container/qke_plus/faq/cluster_faq/',
  qke_doc_more_help_faq: '/user_guide/container/qke_plus/faq/cluster_faq/',

  /**
   * 云监控 CloudSat
   */
  // management 云监控 监控概览
  management_cloudsat_monitoring_overview: '/monitor_service/cloudsat/manual/monitoring_overview/',
  // Dashboard
  management_cloudsat_dashboard_guide: '/monitor_service/cloudsat/manual/dashboard/',
  // 分组管理
  management_cloudsat_resource_groups_guide: '/monitor_service/cloudsat/manual/group_management/',
  // 事件监控
  management_cloudsat_events_guide: '/monitor_service/cloudsat/manual/event_monitor/',
  // 平台告警服务
  management_cloudsat_platform_alarm_guide: '/monitor_service/cloudsat/manual/alarm_service/',
  // 自定义监控
  management_cloudsat_custom_monitoring_guide: '/monitor_service/cloudsat/manual/custom_monitor/',
  //  自定义告警服务 ??这些地址定位不是很清楚
  management_cloudsat_custom_alarm_guide: '/monitor_service/cloudsat/manual/alarm_service/',
  // 告警策略
  management_cloudsat_alarm_policy: '/monitor_service/cloudsat/manual/alarm_service_new/alarm_policy/',
  // 告警记录
  management_cloudsat_alarm_history: '/monitor_service/cloudsat/manual/alarm_service_new/alarm_history/',
  // 一键告警
  management_cloudsat_alarm_onekey: '/monitor_service/cloudsat/manual/alarm_service_new/alarm_onekey/',
  // 云服务监控-负载均衡器
  management_cloudsat_cloud_service_load_balancer: '/monitor_service/cloudsat/manual/cloud_service/load_balancer/',
  // 云服务监控-应用服务
  management_cloudsat_cloud_service_service: '/monitor_service/cloudsat/manual/cloud_service/service/',

  /**
   * 对象存储
   */
  // 使用指南
  storage_qingstor_guide: '/storage/object_storage/manual/',
  // API 文档
  storage_qingstor_api_manual: '/storage/object_storage/api/',
  // 最新动态
  storage_qingstor_news: '/storage/object_storage/news/history/',
  // 计费文档
  storage_qingstor_price_billing: '/storage/object_storage/billing/price/',

  // 存储空间访问控制（ACL）
  // 使用指南
  storage_qingstor_acl_bucket_acl_manual:
    '/storage/object_storage/manual/console/bucket_manage/access_control/#_存储空间访问控制列表bucket_acl',
  // API 文档
  storage_qingstor_acl_api_manual: '/storage/object_storage/api/bucket/acl/',

  // 跨源资源共享 (CORS)
  // 使用指南
  storage_qingstor_cors_bucket_cors_manual:
    '/storage/object_storage/manual/console/bucket_manage/access_control/#_存储空间的跨域资源共享策略bucket_cors',
  // API 文档
  storage_qingstor_cors_api_manual: '/storage/object_storage/api/bucket/cors/',

  // 存储空间策略（Policy）
  // 使用指南
  storage_qingstor_bucket_policy_manual:
    '/storage/object_storage/manual/console/bucket_manage/access_control/#存储空间策略bucket-policy',
  // API 文档
  storage_qingstor_bucket_policy_api_manual: '/storage/object_storage/api/bucket/policy/',

  // 外部镜像（External Mirror） api
  storage_qingstor_external_mirror_manual: '/storage/object_storage/api/bucket/external_mirror/',

  // 生命周期（Lifecycle）
  // 使用指南
  storage_qingstor_lifecycle_manual: '/storage/object_storage/manual/console/bucket_manage/lifecycle/',
  // API 文档
  storage_qingstor_lifecycle_api_manual: '/storage/object_storage/api/bucket/lifecycle/',

  // 日志（Logging）
  // 使用指南
  storage_qingstor_log_manual: '/storage/object_storage/manual/console/bucket_manage/logging/',
  // API 文档
  storage_qingstor_log_api_manual: '/storage/object_storage/api/bucket/logging/',

  // 跨区域复制 (Cross-Region Replication)
  // 使用指南
  storage_qingstor_bucket_cross_region_replication_manual:
    '/storage/object_storage/manual/console/bucket_manage/replication/',
  // API 文档
  storage_qingstor_bucket_cross_region_replication_api_manual: '/storage/object_storage/api/bucket/replication/',

  // 事件通知（Notification）
  // 使用指南
  storage_qingstor_notification_manual: '/storage/object_storage/manual/console/bucket_manage/notification/',
  // API 文档
  storage_qingstor_notification_api_manual: '/storage/object_storage/api/bucket/notification/',

  // 版本管理（Versioning）

  // 使用指南

  storage_qingstor_version_manual: '/storage/object_storage/manual/console/bucket_manage/version/',

  // API 文档

  storage_qingstor_version_api_manual: '/storage/object_storage/api/bucket/version/',

  // WORM

  // 使用指南

  storage_qingstor_worm_manual: '/storage/object_storage/manual/console/bucket_manage/worm/',

  // API 文档

  storage_qingstor_worm_api_manual: '/storage/object_storage/api/bucket/worm/',

  // Multipart 分段
  storage_qingstor_multipart_manual: '/storage/object_storage/api/object/multipart/',
  // 完成分段
  storage_qingstor_multipart_complete_manual: '/storage/object_storage/api/object/multipart/complete/',

  // 对象存储元数据
  storage_qingstor_metadata_manual: '/storage/object_storage/api/metadata/',

  // 数据处理使用指南
  storage_qingstor_process_manual: '/storage/object_storage/manual/console/data_process/',

  // 图片处理 API 文档
  storage_qingstor_image_process_manual: '/storage/object_storage/api/object/image_process/',

  // 图谱鉴黄 API 文档
  storage_qingstor_tupu_porn_guide: '/storage/object_storage/manual/console/data_process/tupu_porn/',

  // 自定义域名操作文档
  storage_qingstor_bucket_cname_manual: '/storage/object_storage/manual/console/bucket_manage/cname/',

  /**
   * vNAS-文件存储
   */
  // 文件存储 vNAS-文件存储
  storage_vnas_guide: '/storage/vnas/',
  // 文件存储 权限组 ??这些地址定位不是很清楚
  storage_vnas_s2_groups_guide: '/storage/vnas/',
  // 文件存储 账户 ??这些地址定位不是很清楚
  storage_vnas_s2_accounts_guide: '/storage/vnas/',

  /**
   * QFS-文件存储
   */
  // 文件存储 QFS 主页面
  storage_qfs_guide: '/storage/qfs/',
  // 文件存储 qfs 权限管理
  storage_qfs_auth_guide: '/storage/qfs/manual/auth/',
  // 文件存储 qfs 文件系统管理
  storage_qfs_file_system_guide: '/storage/qfs/manual/file_system/',
  // 文件存储 qfs 介绍
  storage_qfs_intro: '/storage/qfs/intro/',
  // 文件存储 qfs 客户端使用
  storage_qfs_client_use: '/storage/qfs/manual/use/',

  /**
   * sd-wan
   */
  // 网关 ??这些地址定位不是很清楚
  sdwan_gateways_guide: '/sd-wan/sdwan/',
  // 专线 ??这些地址定位不是很清楚
  sdwan_lines_guide: '/sd-wan/sdwan/',
  // 创建网关接入点
  sdwan_gateways_access_manual:
    '/sd-wan/sdwan/manual/wan_access/#%E5%88%9B%E5%BB%BA%E7%BD%91%E5%85%B3%E6%8E%A5%E5%85%A5%E7%82%B9',
  // sdwan 连接云网
  new_sdwan_nets_guide: '/sd-wan/sdwan_new/intro/10_sdwan/',
  new_sdwan_operation_log_guide: '/sd-wan/sdwan_new/usermanual/70_mgmt_log/10_view_log/',
  // 企业云网
  sdwan_guide: '/sd-wan/sdwan/',
  // 光盒
  sdwan_light_box_guide: '/sd-wan/light-box/',
  // 部署软件 VCPE
  new_sdwan_deploy_script_vcpe_manual: '/sd-wan/sdwan_new/open_access_point/vcpe/40_deploy_script/',
  new_sdwan_open_access_point_create_vcpe: '/sd_wan/sdwan_new/open_access_point/vcpe/30_create_vcpe/',
  sdwan_service_light_box_manual: '/sd-wan/light-box/manual/service/',
  // 物理光盒
  sdwan_physical_cpe_manual: '/sd-wan/light-box/manual/base/',
  new_sdwan_price_new_billing: '/sd-wan/sdwan_new/new_billing/10_new_billing/',
  // 常见问题
  sdwan_new_faq_10_faq_sdwan: '/sd-wan/sdwan_new/faq/10_faq_sdwan',
  // 退费说明
  sdwan_new_new_billing_refund: '/sd_wan/sdwan_new/new_billing/40_refund/',

  /**
   * iam
   */
  // admin 身份管理
  admin_iam_roles_guide: '/authorization/iam/manual/role/',
  // 策略管理
  admin_iam_policies_guide: '/authorization/iam/manual/policy/',
  // 用户管理(公测中)
  admin_iam_user_guide: '/authorization/iam/manual/user/',
  // 操作日志
  admin_iam_activity_guide: '/authorization/iam/manual/log/',
  admin_iam_assume_role_faq: '/authorization/iam/faq/assume_role/',
  admin_iam_guide: '/authorization/iam/',
  // 资源标识符 QRN
  admin_iam_qrn_faq: '/authorization/iam/faq/qrn/',

  /**
   * 安全组
   */
  security_security_group_guide: '/security/security_group/manual/sg_create/',
  // 规则子集 ??这些地址定位不是很清楚
  security_security_group_rule_subset_guide: '/security/security_group/manual/sg_create/',
  // IP/端口集合 ??这些地址定位不是很清楚
  security_security_group_ipsets_guide: '/security/security_group/manual/sg_create/',
  // 配置安全组
  security_security_group_sg_setting_manual: '/security/security_group/manual/sg_setting/',

  /**
   * 安全
   */
  // Web 应用防火墙
  security_waf_guide: '/security/waf/manual/waf_user_guide/',
  // IP/端口集合 ??这些地址定位不是很清楚
  security_waf_parameter_groups_guide: '/security/waf/manual/waf_user_guide/',
  security_acl_network_access_control_guide: '/security/acl/manual/acl_manual/',
  // 基础网络安全策略
  security_acl_basic_guide: '/security/acl/manual/acl_basic/',
  // 密钥管理服务
  security_kms_guide: '/security/key_management_service/manual/operation/',

  // 高防ip 老版本
  security_high_defense_guide: '/security/antiddos_ip/manual/antiddos_user_guide/',
  security_ddos_defense_guide: '/security/ddos_defense/manual/antiddos_user_guide/',

  // 项目-成员
  project_member_guide: '/operation/resource/manual/project/member_role/',
  // 项目-角色
  project_group_roles_guide: '/operation/resource/manual/project/member_role/',
  // 消费与用量
  project_group_roles_statistics_manual: '/operation/resource/manual/project/statistics/',

  /**
   * appcenter
   */
  // appcenter_
  // management 定时器Scheduler
  management_scheduler_guide: '/operation/tools/manual/scheduler/',
  // 自动伸缩
  management_autoscaling_policies_guide: '/operation/autoscaling/manual/autoscaling/',
  // 资源编排
  management_topology_templates_guide: '/operation/topology/',
  // 操作日志
  management_activities_jobs_guide: '/operation/tools/manual/activity/',
  // 资源编排 标签
  management_tags_guide: '/operation/tools/manual/label/',
  // 回收站
  management_recyclebin_guide: '/operation/tools/manual/recycle_bin/',
  // 云服务器启动配置 ??这些地址定位不是很清楚
  management_launch_configurations_guide: '/operation/autoscaling/manual/autoscaling/',
  // 已生成编排 ??这些地址定位不是很清楚
  management_topologies_guide: '/operation/topology/',
  // 服务器迁移中心 SMC
  management_smc_v2v_migration_guide: '/operation/migration/manual/preparation/',
  // 操作日志 全局操作日志 ??这些地址定位不是很清楚
  management_activities_global_jobs_guide: '/operation/tools/manual/activity/',
  // 操作日志 导出 ??这些地址定位不是很清楚
  management_activities_export_guide: '/operation/tools/manual/activity/',
  /**
   * 数据库
   */
  database_mysql_plus_guide: '/database/mysql/',
  database_mysql_plus_access_manual: '/database/mysql/quickstart/access_mysqlplus/',
  database_mysql_plus_faq: '/database/mysql/faq/access_problems/',
  database_postgresql_guide: '/database/postgresql/',
  database_radondb_guide: '/database/radondb/',
  database_polondb_guide: '/database/polondb/',
  database_chronusdb_guide: '/database/chronusdb/',
  database_mongodb_guide: '/database/mongodb/',
  database_mongodb_cluster_guide: '/user_guide/database/mongodb_cluster/',
  database_redis_standalone_guide: '/database/redis_standalone/',
  database_redis_cluster_guide: '/database/redis_cluster/',
  database_memcached_guide: '/database/memcached/',
  database_mysql_plus_use_ip_faq:
    '/database/mysql/faq/access/#%E5%A6%82%E4%BD%95%E5%AE%9A%E4%BD%8D%E6%9C%AC%E5%9C%B0%E8%AE%BE%E5%A4%87%E7%9A%84%E5%85%AC%E7%BD%91-ip-%E5%9C%B0%E5%9D%80',
  /**
   * Docker
   */
  // Docker 镜像仓库
  containers_docker_repos_guide: '/product/container/docker_hub', // 使用的老文档
  // 命名空间 ??这些地址定位不是很清楚
  containers_docker_namespaces_guide: '/product/container/docker_hub', // 使用的老文档
  // 用户管理 ??这些地址定位不是很清楚
  containers_docker_users_guide: '/product/container/docker_hub', // 使用的老文档

  /**
   * 中间件
   */
  // middleware API 管理
  middleware_apig_apiservice_guide: '/middware/api_gateway/',
  middleware_kafka_guide: '/middware/kafka/',
  middleware_rabbitmq_guide: '/middware/rabbitmq/',
  middleware_rocketmq_guide: '/middware/rocketmq/',
  middleware_etcd_guide: '/middware/etcd/',

  /**
   * 公共
   */
  // 区域及可用区
  helpcenter_area_public: '/helpcenter/area/',
  // 计费模式
  helpcenter_billing_public: '/helpcenter/billing/',
  // 数据盘
  helpcenter_data_public: '/helpcenter/data/',
  // 网络
  helpcenter_net_public: '/helpcenter/net/',
  // 网卡
  helpcenter_nic_public: '/helpcenter/nic/',
  // 弹性公网IP
  helpcenter_eip_public: '/helpcenter/eip/',
  // 安全组
  helpcenter_security_public: '/helpcenter/security/',
  // 登录方式
  helpcenter_login_public: '/helpcenter/login/',
  // 网卡多队列
  helpcenter_line_public: '/helpcenter/line/',
  // 备份策略
  helpcenter_backup_public: '/helpcenter/backup/',
  // 安置策略组
  helpcenter_settle_public: '/helpcenter/settle/',
  helpcenter_secret_public: '/helpcenter/secret/',
  helpcenter_vm_type_public: '/helpcenter/vm_type/',
  // 系统盘
  helpcenter_system_public: '/helpcenter/system/',

  // 合同管理
  services_contract_manual: '/services/bill_center/manual/finance/contract/',
  services_according_need_billing: '/services/bill_center/bill_guide/according_need/',
  services_bill_center_guide: '/services/bill_center/bill_guide/overview/',
  //消费预估
  services_estimated_manual: '/services/bill_center/manual/consump_bill/forecast/#note',
  // 预留合约
  services_reserved_contracts_cancellation_guide: '/user_guide/services/bill_center/bill_guide/reserved/',

  // cloudmarket 已购买服务
  cloudmarket_products_guide: '/appcenter/market/manual/25_goods_use/use_saas/',
  // 交付中心
  cloudmarket_services_guide: '/appcenter/market/manual/25_goods_use/use_service/',

  iot_guide: '/iot/beta/zh-CN/introduction/about-qingcloud-iot/',

  development_docs_api_manual: '/development_docs/api/',
  // 区域及可用区
  zone_and_availability_zone_manual: '/operation/resource/intro/region_intro/',

  dwh_bi_clickhouse_guide: '/database/clickhouse/',
  // dwh_bi_hashdata_guide: '/dwh_bi/hashdata/',
  container_qke_guide: '/container/qke/',

  appcenter_app_guide: '/app/index.html',
  // 镜像市场入驻技术文档
  appcenter_image_app_guide: '/image_app/index.html',
  bigdata_spark_guide: '/product/big_data/spark.html', // 还不知道又没有了。
  bigdata_queue_manual: '/product/big_data/queue',
  admin_iam_json_manual: '/product/iam/json.html',
  compute_dedicated_host_manual: '/product/computing/dedicated_host.html#guide-dedicated-host',
  compute_instances_ssh_access_faq: '/product/faq/index.html#ssh',
  compute_cloud_desktop_manual: '/product/computing/cloud_desktop.html#id2',
  containers_qci_restart_strategy_manual: '/product/container/qci.html#%E9%87%8D%E5%90%AF%E7%AD%96%E7%95%A5',
  compute_instances_windows_disk_faq: '/product/faq/index.html#id10',
  storage_disk_introduction_intro: '/storage/disk/intro/introduction/',
  // bigdata_queue_manual: '/product/big_data/queue.html#id5',
  // xxx_iam_index: '/product/iam/index.html',
  compute_instances_samedata_multiple_faq: '/product/faq/index.html#id35',
  network_eip_price_billing: '/product/faq/index.html#id23',
  // compute_instances_userdata_manual: '/product/computing/userdata.html',

  project_resource_manual: '/operation/resource/manual/project/resources/',

  security_ddos_defense_price_billing: '/product/security/antiddos_ip/antiddos_billing_mode',
  domain_ssl_valid_domain_manual: '/product/security/ssl#valid-domain',
  middleware_tomcat_guide: '/product/middware/tomcat/',
  ai_deeplearning_guide: '/product/ai/deeplearning/',
  ai_inference_guide: '/product/ai/inference/',
  helpcenter_faq: '/product/faq/',
  services_notification_center_manual: '/services/notification-center/',
  admin_iam_principal_faq: '/authorization/iam/faq/principal/',

  network_loadbalancer_info_manual: '/product/network/loadbalancer.html#id3',
  network_pcdn_price_billing: '/product/network/pcdn#%E4%BB%B7%E6%A0%BC',
  computing_instances_encryption_manual: '/product/computing/encryption',
  project_resource_add_to_project_manual:
    '/operation/resource/manual/project/resources/#%E5%B0%86%E8%B5%84%E6%BA%90%E6%B7%BB%E5%8A%A0%E5%88%B0%E9%A1%B9%E7%9B%AE',
  project_resource_to_create_resource_manual:
    '/operation/resource/manual/project/resources/#%E5%9C%A8%E9%A1%B9%E7%9B%AE%E4%B8%AD%E5%88%9B%E5%BB%BA%E8%B5%84%E6%BA%90',

  domain_dns_mgtdomainserver_manual: '/site/dns/manual/dnsrecord/mgtdomainserver/',
  domain_dns_resolutionmode_manual: '/site/dns/manual/dnsrecord/resolutionmode/',
  management_scheduler_intro: '/operation/tools/intro/scheduler/',

  // cloudsat
  monitoring_overview_guide: '/monitor_service/cloudsat/manual/monitoring_overview/',

  //instance 0111新增
  //创建主机自定义用户数据说明
  compute_instances_userdata: 'compute/vm/manual/userdata/',
  //弹性裸金属服务器的vpc关联的边界路由器说明
  compute_instances_baremetal_router_border: '/compute/vm/manual/vm_instance/#网络配置',
  compute_hpc_guide: '/compute/hpc/',
  compute_hpc_price_billing: '/compute/hpc/billing/10_price/',
  compute_hpc_create_ehpc: '/compute/hpc/quick-start/create_ehpc/',
  compute_hpc_submit_job: '/compute/hpc/quick-start/submit_job/',
  compute_hpc_job_result: '/compute/hpc/quick-start/job_result/',
  compute_hpc_intro: '/compute/hpc/intro/intro/',
  compute_hpc_software: '/compute/hpc/manual/software/',
  compute_hpc_remote_login: '/compute/hpc/manual/cluster/base_manage/remote_login/',
  compute_hpc_spack_install: '/compute/hpc/help/spack/install/',
  compute_hpc_singularity: '/compute/hpc/best-practices/sample3/',
  compute_hpc_lammps: '/compute/hpc/best-practices/sample1/',

  appcenter_dev_platform_intro: '/user_guide/appcenter/dev-platform/introduction/introduction/',
  appcenter_saas_app_release_guide: '/user_guide/appcenter/dev-platform/saas-developer-guide/release/',

  // icp
  icp_site_record: '/site/record/',
  icp_site_record_prepare_prepare_vm: '/site/record/prepare/prepare_vm/',
  icp_site_record_manual_change_filing: '/site/record/manual/change_filing/',
  icp_site_record_prepare_prepare_material: '/site/record/prepare/prepare_material/',
  icp_site_record_faq_basic: '/site/record/faq/basic/#',
  icp_site_record_faq_icp_faq: '/site/record/faq/icp_faq/#',
  icp_site_record_policy_site_name: '/site/record/policy/site_name/',
  icp_site_record_prepare_policy_requirement_policy_requirement:
    '/site/record/prepare/policy_requirement/policy_requirement/',
  icp_site_record_faq_complete: '/site/record/faq/complete/',
  icp_site_record_prepare_pre_approval: '/site/record/prepare/pre_approval/',

  // api网关
  middleware_apig_apiservice_guide: '/user_guide/middware/api_gateway/', // 使用指南
  middleware_apig_billing: '/user_guide/middware/api_gateway/billing/price/', // 计费指南
  // 顶部导航指南
  navigation_guide: '/v6.1/helpcenter/product_guidance/',

  // vdc
  vdc_organization_management: '/authorization/vdc/manual/mgt_org/create_org/', //组织管理
  vdc_user_management: '/authorization/vdc/manual/mgt_user/create_user/', //用户管理
  vdc_quota_management: '/authorization/vdc/manual/mgt_quota/custom/', // 组织配额
  vdc_learn_more: '/authorization/vdc/quickstart/subscribe/', //了解更多
  vdc_resource_management: '/authorization/vdc/manual/mgt_resource/view/', // 资源管理

  /**
   * qke
   */
  qke_doc_question_container_faq: '/user_guide/container/qke_plus/intro/introduction/',
  qke_doc_aply_scenarios_faq: '/user_guide/container/qke_plus/intro/aply_scenarios/',
  //-------------- 以下为覆盖后遗漏字段
  qke_doc_container_faq: '/container/qke_plus/intro/introduction/',

  storage_vsan_share_creat_manual: '/storage/share/manual/vsan/#%E5%88%9B%E5%BB%BA%E7%9B%AE%E6%A0%87',

  storage_disk_volumes_guide: '/storage/disk/',
  storage_backup_snapshots_guide: '/storage/backup/intro/introduction/',
  storage_vsan_share_guide: '/storage/share/',
  // 共享备份 ??这些地址定位不是很清楚
  storage_backup_snapshots_shared_guide: '/storage/backup/intro/introduction/',
  storage_disk_news: '/storage/disk/news/product_news/',
  // ********** billing 产品计费 ***********
  storage_disk_price_billing: '/storage/disk/billing/price/',
  storage_disk_introduction_guide: 'storage_disk_introduction_guide',
  storage_disk_linux_auto_mount_manual: '/storage/disk/manual/auto_mount/linux_auto_mount/',

  qke_use_guide: '/container/qke_plus/news/prodoct_news',
  qke_mg_service_faq:
    '/container/qke_plus/manual/service/mg_service/#%E5%B0%86%E6%9C%8D%E5%8A%A1%E6%9A%B4%E9%9C%B2%E7%BB%99%E5%A4%96%E7%BD%91',

  storage_multipart_manual: '/storage/object_storage/api/object/multipart/',
  database_redis_cluster_perfwp: '/user_guide/database/redis_cluster/perfwp/test_tool/',

  //主机安全

  security_hss_product_info: '', // 了解更多

  security_hss_product_guide: '', // 使用指南

  security_hss_product_price_billing: '', // 计费

  storage_disk_create_snapshot_manual: '/user_guide/storage/disk/manual/create_snapshot/',
  storage_disk_load_quickstart: '/user_guide/storage/disk/quickstart/load/',
};
