export default function SkeletonCard() {
  
    return (   
        <div className="rounded-xl border p-4 space-y-4 animate-pulse">    
            <div className="aspect-[4/3] bg-slate-200 rounded" />      
            <div className="h-4 w-3/4 bg-slate-200 rounded" />     
            <div className="h-3 w-1/2 bg-slate-200 rounded" />   
            <div className="h-4 w-1/4 bg-slate-200 rounded" /> 
        </div>
    );
}