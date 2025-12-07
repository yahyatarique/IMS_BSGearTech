// 'use client';

// import { useEffect, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { GradientBorderCard } from '@/components/ui/gradient-border-card';
// import { error as errorToast } from '@/hooks/use-toast';
// import {  X, Loader2 } from 'lucide-react';
// import { MaterialStats } from '@/services/types/inventory.api.type';
// import { fetchInventoryStats } from '@/services/inventory';

// interface InventoryStatsCardsProps {
//   onClose?: () => void;
// }

// export function InventoryStatsCards({ onClose }: InventoryStatsCardsProps) {
//   const [stats, setStats] = useState<MaterialStats | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);

//   useEffect(() => {
//     loadStats();
//   }, []);

//   const loadStats = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
//       const response = await fetchInventoryStats();
//       if (response.success) {
//         setStats(response.data.stats);
//       }
//     } catch (err: any) {
//       const message = err.message || 'Failed to load inventory stats';
//       setError(message);
//       errorToast({
//         title: 'Error',
//         description: message
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };



//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center p-8">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   if (error || !stats) {
//     return (
//       <div className="flex flex-col items-center justify-center gap-4 p-8">
//         <p className="text-muted-foreground">Failed to load inventory stats</p>
//         <Button onClick={loadStats}>Retry</Button>
//       </div>
//     );
//   }

//   if (Object.values(stats).length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center gap-4 p-8">
//         <p className="text-muted-foreground">No inventory stats found</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {onClose && (
//         <div className="flex justify-end">
//           <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
//             <X className="h-4 w-4" />
//           </Button>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {Object.entries(stats).map(([materialType, materialStats]) => (
//           <GradientBorderCard key={materialType} className="overflow-hidden">
//             <div className="p-6 space-y-4">
//               {/* Material Header */}
//               <div className="flex items-center justify-between">
//                 <h3 className="text-lg font-semibold">{materialType}</h3>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() =>
//                     setExpandedMaterial(expandedMaterial === materialType ? null : materialType)
//                   }
//                 >
//                   {expandedMaterial === materialType ? 'Show Less' : 'Show All'}
//                 </Button>
//               </div>

//               {/* Stats List */}
//               <div className="space-y-3">
//                 {materialStats
//                   .slice(0, expandedMaterial === materialType ? undefined : 1)
//                   .map((stat, index) => (
//                     <div
//                       key={`${stat.dimensions.outer_diameter}-${stat.dimensions.length}-${index}`}
//                       className="bg-card p-3 rounded-lg space-y-2"
//                     >
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm font-medium">
//                           {stat.dimensions.outer_diameter}mm OD × {stat.dimensions.length}mm L
//                         </span>
//                       </div>

//                       <div className="grid grid-cols-2 gap-4 text-sm">
//                         <div>
//                           <p className="text-muted-foreground">Weight</p>
//                           <p className="font-medium">
//                             {stat.total.weight?.toFixed(2)} {stat.unit}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-muted-foreground">Rate</p>
//                           <p className="font-medium">
//                             ₹{stat.rate?.toFixed(2)}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}

//                 {materialStats.length > 3 && expandedMaterial !== materialType && (
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="w-full text-primary"
//                     onClick={() => setExpandedMaterial(materialType)}
//                   >
//                     Show {materialStats.length - 3} more sizes...
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </GradientBorderCard>
//         ))}
//       </div>
//     </div>
//   );
// }
