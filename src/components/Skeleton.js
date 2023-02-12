import classNames from "classnames";

function Skeleton({ times, className }){
    const outerDivClassNames = classNames(
        'relative',
        'overflow-hidden',
        'bg-gray-200',
        'rounded',
        'mb-2.5',
        className
    );
    const innerDivClassNames = classNames(
        'animate-shimmer',
        'absolute',
        'inset-0',
        '-translate-x-full',
        'bg-gradient-to-r',
        'from-gray-200',
        'via-white',
        'to-gray-200'
    );

    const boxes = Array(times).fill(0).map((_, i) => {
        return <div key={i} className={outerDivClassNames} >
                <div className={innerDivClassNames}/>
            </div>;
    });

    return boxes;
    /*
        Here, writing _ (underscore) in map method means we just don't care
        about that argument.  
    */
}

export default Skeleton;