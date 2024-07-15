/*
 * Copyright (C) 2024 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useCallback, useEffect, useState} from 'react'
import {Element, useNode, useEditor} from '@craftjs/core'
import ContentEditable from 'react-contenteditable'

import {Flex} from '@instructure/ui-flex'
import {IconButton} from '@instructure/ui-buttons'
import {Tabs} from '@instructure/ui-tabs'
import {type ViewOwnProps} from '@instructure/ui-view'
import {IconXLine} from '@instructure/ui-icons'

import {Container} from '../Container'
import {TabBlock} from './TabBlock'
import {useClassNames} from '../../../../utils'
import type {TabsBlockTab, TabsBlockProps} from './types'
import {TabsBlockToolbar} from './TabsBlockToolbar'

const TabsBlock = ({tabs, variant = TabsBlock.custom.defaultProps.variant}: TabsBlockProps) => {
  const {actions, enabled} = useEditor(state => ({
    enabled: state.options.enabled,
  }))
  const {
    actions: {setProp},
    id,
  } = useNode(state => ({
    id: state.id,
    selected: state.events.selected,
  }))
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
  const clazz = useClassNames(enabled, {empty: !tabs?.length}, ['block', 'tabs-block'])

  useEffect(() => {
    if (!tabs || tabs.length === 0) {
      setProp((props: TabsBlockProps) => {
        props.tabs = TabsBlock.craft.defaultProps.tabs
      })
    }
  }, [tabs, setProp])

  const handleTabChange = useCallback(
    (
      _event: React.MouseEvent<ViewOwnProps> | React.KeyboardEvent<ViewOwnProps>,
      tabData: {index: number}
    ) => {
      setActiveTabIndex(tabData.index)
      actions.selectNode(id)
    },
    [actions, id]
  )

  const handleTabTitleChange = useCallback(
    e => {
      setProp((props: TabsBlockProps) => {
        if (!props.tabs) return
        props.tabs[activeTabIndex].title = e.target.value
      })
    },
    [activeTabIndex, setProp]
  )

  const handleTabTitleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  const handleTabTitleFocus = useCallback(
    (tabIndex: number) => {
      setActiveTabIndex(tabIndex)
      actions.selectNode(id)
    },
    [actions, id]
  )

  const handleDeleteTab = useCallback(
    tabIndex => {
      if (!tabs) return
      const newTabs = [...tabs]
      newTabs.splice(tabIndex, 1)
      setProp((props: TabsBlockProps) => {
        props.tabs = newTabs
      })
    },
    [setProp, tabs]
  )

  const renderTabTitle = (title: string, index: number) => {
    return enabled ? (
      <Flex gap="small">
        <ContentEditable
          data-placeholder="Tab Title"
          html={title}
          tagName="span"
          onChange={handleTabTitleChange}
          onFocus={handleTabTitleFocus.bind(null, index)}
          onKeyDown={handleTabTitleKey}
        />
        {tabs && tabs.length > 1 && (
          <div style={{marginBlockStart: '-.5rem'}}>
            <IconButton
              themeOverride={{smallHeight: '.75rem'}}
              screenReaderLabel="Delete Tab"
              size="small"
              withBackground={false}
              withBorder={false}
              onClick={handleDeleteTab.bind(null, index)}
            >
              <IconXLine size="x-small" themeOverride={{sizeXSmall: '.5rem'}} />
            </IconButton>
          </div>
        )}
      </Flex>
    ) : (
      title
    )
  }

  const renderTabs = () => {
    return tabs?.map((tab: TabsBlockTab, index: number) => {
      return (
        <Tabs.Panel
          key={tab.id}
          id={tab.id}
          renderTitle={renderTabTitle(tab.title, index)}
          isSelected={activeTabIndex === index}
        >
          <Element
            id={`${tab.id}_nosection1`}
            tabId={tab.id}
            is={TabBlock}
            canvas={true}
            hidden={activeTabIndex !== index}
          />
        </Tabs.Panel>
      )
    })
  }

  return (
    <Container className={clazz}>
      <Tabs
        variant={variant === 'modern' ? 'default' : 'secondary'}
        onRequestTabChange={handleTabChange}
      >
        {renderTabs()}
      </Tabs>
    </Container>
  )
}

TabsBlock.craft = {
  displayName: 'Tabs',
  defaultProps: {
    tabs: [
      {
        id: 'default-tab-1',
        title: 'Tab 1',
      },
      {
        id: 'default-tab-2',
        title: 'Tab 2',
      },
    ],
    variant: 'modern',
  },
  related: {
    toolbar: TabsBlockToolbar,
  },
  custom: {},
}

export {TabsBlock}
