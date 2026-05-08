'use client'

import React from 'react'

export type Scope = 'my' | 'team' | 'org'

const GM_ROLES = ['gm', 'admin', 'super_admin']
const ADMIN_ROLES = ['admin', 'super_admin']

interface Props {
  scope: Scope
  onChange: (scope: Scope) => void
  role: string
}

export function ScopeToggle({ scope, onChange, role }: Props) {
  const canSeeTeam = GM_ROLES.includes(role)
  const canSeeOrg = ADMIN_ROLES.includes(role)

  if (!canSeeTeam) {
    return (
      <span className="text-xs text-gray-500 font-medium px-2.5 py-1 bg-gray-100 rounded-full">
        My
      </span>
    )
  }

  const options: { value: Scope; label: string }[] = [
    { value: 'my', label: 'My' },
    { value: 'team', label: 'My Team' },
    ...(canSeeOrg ? [{ value: 'org' as Scope, label: 'Organization' }] : []),
  ]

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5 flex-shrink-0">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
            scope === opt.value
              ? 'bg-[#422D83] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
