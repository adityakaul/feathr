import React, { useCallback, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button, Dropdown, Input, Menu, message, Popconfirm, Select, Tabs, Tag, Tooltip } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import TableResize from './resizableTable/resizableTable';
import { IFeature } from "../models/model";
import { deleteFeature, fetchFeatures } from '../api';

const { TabPane } = Tabs;

const FeatureList: React.FC = () => {
  const history = useHistory();
  const navigateTo = useCallback((location) => history.push(location), [history]);
  const projectOptions = [
    { label: <Tag color={ "green" }>feathr_awe_demo</Tag>, value: "nyc", selected: true }
  ];
  const columns = [
    {
      title: <div style={ { userSelect: "none" } }>Name</div>,
      dataIndex: 'name',
      key: 'name',
      render: (name: string, row: IFeature) => {
        return (
          <Button type="link" onClick={ () => {
            navigateTo(`/features/${ row.qualifiedName }`)
          } }>{ name }</Button>
        )
      },
      width: 150,
      onCell: () => {
        return {
          style: {
            maxWidth: 120,
          }
        }
      }
    },
    {
      title: <div style={ { userSelect: "none" } }>Qualified Name</div>,
      dataIndex: 'qualifiedName',
      key: 'qualifiedName',
      align: 'center' as 'center',
      width: 190,
      onCell: () => {
        return {
          style: {
            maxWidth: 120
          }
        }
      }
    },
    {
      title: (<div style={ { userSelect: "none" } }>Action <Tooltip
        title={ <Link style={ { color: "cyan" } } to="/help">Learn more</Link> }></Tooltip></div>),
      dataIndex: 'action',
      key: 'action',
      align: 'center' as 'center',
      width: 120,
      render: (name: string, row: IFeature) => (
        <Dropdown overlay={ () => {
          return (
            <Menu>
              <Menu.Item key="edit">
                <Button type="link" onClick={ () => {
                  navigateTo(`/features/${ row.qualifiedName }`)
                } }>Edit</Button>
              </Menu.Item>
              <Menu.Item key="delete">
                <Popconfirm
                  placement="left"
                  title="Are you sure to delete?"
                  onConfirm={ () => {
                    onDelete(row.id)
                  } }
                >
                  Delete
                </Popconfirm>
              </Menu.Item>
            </Menu>
          )
        } }>
          <Button icon={ <DownOutlined /> }>
            action
          </Button>
        </Dropdown>
      )
    }
  ];
  const limit = 10;
  const defaultPage = 1;
  let [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  let [tableData, setTableData] = useState<IFeature[]>();
  let [tabValue, setTab] = useState<string>("my");
  let [query, setQuery] = useState<string>("");
  const fetchData = useCallback(async () => {
      setLoading(true);
      const result = await fetchFeatures(page, limit, query);
      setPage(page);
      setTableData(result);
      setLoading(false);
    }, [page, query]
  )

  useEffect(() => {
    fetchData();
  }, [fetchData])

  const onTabChange = useCallback((currentTab) => {
      setTab(currentTab);
      fetchData(); // TODO: Load correct data when tab change fires
    },
    [fetchData],
  )


  const onKeywordChange = useCallback(
    (value) => {
      setQuery(value);
    }, []
  )

  const onClickSearch = () => {
    setPage(defaultPage);
    fetchData();
  }

  const onDelete = async (id: string) => {
    setLoading(true);
    const res = await deleteFeature(id);
    if (res.status === 200) {
      message.success(`Feature ${ id } deleted`);
    } else {
      message.error("Failed to delete feature with id {id}");
    }
    setLoading(false);
    fetchData();
  }

  return (
    <div>
      <Select placeholder="Select a project" style={ { width: "18%", marginLeft: "5px" } }
              options={ projectOptions } mode="tags" showArrow />
      <Input placeholder="keyword" style={ { width: "10%", marginLeft: "5px" } }
             onChange={ (e) => onKeywordChange(e.target.value) } onPressEnter={ fetchData } />
      <Button onClick={ onClickSearch } type="primary" style={ { marginLeft: "5px" } }>Search</Button>
      <div>
        <Tabs tabBarGutter={ 80 } size="large" activeKey={ tabValue } onChange={ onTabChange }>
          <TabPane tab="My Features" key="my"></TabPane>
          <TabPane tab="All Features" key="all"></TabPane>
        </Tabs>
      </div>
      <TableResize
        dataSource={ tableData }
        columns={ columns }
        rowKey={ "id" }
        loading={ loading }
      />
    </div>
  );
}

export default FeatureList;
