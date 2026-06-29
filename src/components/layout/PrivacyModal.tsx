// interface PrivacyModalProps {
//   onClose: () => void
// }

// function PrivacyModal({ onClose }: PrivacyModalProps) {
//   return (
//     <div 
//       onClick={onClose} 
//       style={{ 
//         position: 'fixed', inset: 0, 
//         background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', 
//         zIndex: 200, display: 'flex', 
//         alignItems: 'center', justifyContent: 'center' 
//       }}
//     >
//       <div 
//         onClick={e => e.stopPropagation()} 
//         style={{ 
//           background: 'var(--surface)', border: '1px solid var(--border)', 
//           borderRadius: 16, width: '100%', maxWidth: 440, 
//           padding: 24, display: 'flex', flexDirection: 'column', 
//           boxShadow: '0 32px 80px rgba(0,0,0,0.6)', fontFamily: 'DM Sans, sans-serif'
//         }}
//       >
//         {/* Header */}
//         <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: 16 }}>
//           <h3 style={{ margin: 0, fontFamily: 'Space Grotesk', fontSize: 24, letterSpacing: 1.5, color: 'var(--text)' }}>
//             Privacy & Security
//           </h3>
//           <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
//         </div>

//         {/* Content Description */}
//         <div style={{ color: 'var(--text)', fontSize: 13, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12 }}>
//           <p style={{ margin: 0 }}>
//             Your gaming shelf configuration is secured at the database layer using PostgreSQL Row Level Security (RLS).
//           </p>
//           <blockquote style={{ margin: 0, padding: '10px 14px', background: 'var(--bg)', borderLeft: '3px solid var(--accent)', borderRadius: 6, color: 'var(--muted)', fontSize: 12 }}>
//             "Even if someone manages to find or guess your public project API keys, they are hard-blocked from viewing, modifying, or deleting any game logs belonging to your account id."
//           </blockquote>
//           <p style={{ margin: 0 }}>
//             By default, your shelf layout is <strong>Public</strong> so friends can view your cabinet and follow your progression tracker, but you can toggle your profile to <strong>Private</strong> anytime inside your account management console to lock down visibility completely.
//           </p>
//         </div>

//         {/* Dismiss Footer Action */}
//         <button 
//           onClick={onClose} 
//           style={{ 
//             marginTop: 20, padding: '10px 0', borderRadius: 8, 
//             background: 'var(--surface2)', color: 'var(--text)', fontWeight: 600, 
//             fontSize: 13, cursor: 'pointer', border: '1px solid var(--border)',
//             transition: 'all 0.15s'
//           }}
//           onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
//           onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface2)')}
//         >
//           Understood, Close
//         </button>
//       </div>
//     </div>
//   )
// }